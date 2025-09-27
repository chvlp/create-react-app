import * as React from "react";
import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    type UniqueIdentifier,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {restrictToVerticalAxis} from "@dnd-kit/modifiers";
import {arrayMove, SortableContext, useSortable, verticalListSortingStrategy,} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {
    IconAdjustmentsAlt,
    IconArrowsSort,
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconGripVertical,
    IconPointFilled,
} from "@tabler/icons-react";
import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type Row,
    type SortingState,
    useReactTable,
    type VisibilityState,
} from "@tanstack/react-table";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import type {IconType} from "react-icons";
import {cn} from "@/lib/utils.ts";
import {inToCurrentFloat, intToCurrency} from "@/lib/helper.ts";
import {Checkbox} from "@/components/ui/checkbox.tsx";

/** ---------- Config-driven header types ---------- */

const pageLimit: number[] = [50, 70, 100, 200]

export interface ITableHeaderItem {
    title: string;
    mapping: string;
    width?: number;
    type: "text"
        | "boolean"
        | "image"
        | "currency"
        | "currency-decimal"
        | "date"
        | "datetime"
    align: "left"
        | "center"
        | "right";
    sortable: boolean;
}

export interface ITableHeader {
    is_drag: boolean;
    is_check: boolean;
    is_pagination: boolean;
    is_index: boolean;
    header: ITableHeaderItem[];
}

export interface ITableAction<T> {
    label: string
    type: "delete" | "menu"
    icon?: IconType
    onClick: (data: T) => void
    variant?: "default" | "destructive";
}

export interface ITablePagination {
    pageIndex: number; // 0-based
    totalPage: number;
    totalRowCount: number;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
    onFirstPage: () => void;
    onPreviousPage: () => void;
    onLastPage: () => void;
    onNextPage: () => void;
}

export type ITableActionItem<T> = ITableAction<T> | { type: "separator" };

/** ---------- Utilities ---------- */

const alignToClass: Record<ITableHeaderItem["align"], string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
};

function toNumber(val: unknown): number {
    if (typeof val === "number") return val;
    if (typeof val === "string") {
        const n = Number(val.replace(/,/g, ""));
        return Number.isFinite(n) ? n : NaN;
    }
    return NaN;
}

function toBoolean(val: unknown): boolean | null {
    if (typeof val === "boolean") return val;
    if (typeof val === "number") return val !== 0;
    if (typeof val === "string") {
        const s = val.trim().toLowerCase();
        if (["true", "1", "yes", "y"].includes(s)) return true;
        if (["false", "0", "no", "n"].includes(s)) return false;
    }
    return null;
}

function isSeparator<T>(
    item: ITableActionItem<T>
): item is { type: "separator" } {
    return (item as any).type === "separator";
}

function isAction<T>(item: ITableActionItem<T>): item is ITableAction<T> {
    return (item as any).label !== undefined;
}

function DragHandle({id}: { id: UniqueIdentifier }) {
    const {attributes, listeners} = useSortable({id});
    return (
        <Button
            {...attributes}
            {...listeners}
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-7 cursor-grab w-5"
        >
            <IconGripVertical className="text-muted-foreground size-4"/>
            <span className="sr-only">Drag to reorder</span>
        </Button>
    );
}

/** ---------- Main DataTable ---------- */

function DataTable<T>({
                                 data: initialData,
                                 header,
                                 actions = [],
                                 pagination,
                                 getRowId,                 // <-- NEW
                             }: {
    data: T[];
    header: ITableHeader;
    actions?: ITableActionItem<T>[];
    pagination?: ITablePagination;
    getRowId?: (row: T) => UniqueIdentifier;  // <-- NEW
}) {

    const [sorting, setSorting] = React.useState<SortingState>([]);
    // const [data, setData] = React.useState<T[]>(() => initialData);
    const [data, setData] = React.useState<T[]>(initialData);
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);

    const sortableId = React.useId();
    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor)
    );
    const rowIdFn = React.useMemo(
        () =>
            getRowId ??
            ((row: any) =>
                String(
                    row?.id ??
                    row?.Id ??
                    row?.ID ??
                    row?.uuid ??
                    row?.key ??
                    row?.positionId
                )),
        [getRowId]
    );
    React.useEffect(() => {
        setData(initialData); // Always sync when props change
    }, [initialData]);

    // stable collator + comparator (silences exhaustive-deps)
    const collator = React.useMemo(
        () => new Intl.Collator(undefined, {numeric: true, sensitivity: "base"}),
        []
    );
    const textCompare = React.useCallback(
        (a: unknown, b: unknown): number => {
            const aEmpty = a == null || String(a).trim() === "";
            const bEmpty = b == null || String(b).trim() === "";
            if (aEmpty && bEmpty) return 0;
            if (aEmpty) return 1; // empty/null last
            if (bEmpty) return -1;
            return collator.compare(String(a), String(b));
        },
        [collator]
    );

    const DraggableRow = ({row}: { row: Row<T> }) => {
        const {transform, transition, setNodeRef, isDragging} = useSortable({
            id: rowIdFn(row.original),          // <-- was row.original.id
        });

        return (
            <TableRow
                data-state={row.getIsSelected() && "selected"}
                data-dragging={isDragging}
                ref={setNodeRef}
                className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
                style={{transform: CSS.Transform.toString(transform), transition}}
            >
                {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                ))}
            </TableRow>
        );
    };


    const columns = React.useMemo<ColumnDef<T>[]>(() => {
        const cols: ColumnDef<T>[] = [];
        const hasActions = actions.filter(isAction).length > 0;

        if (header.is_check || header.is_index) {
            cols.push({
                id: "_select",
                enableSorting: false,
                header: ({table}) => (
                    <div
                        className={cn(
                            "flex items-center justify-center gap-2",
                            !header.is_drag ? "pl-5" : "px-0",
                            hasActions ? "pl-16" : ""
                        )}
                        style={{width: header.is_drag ? "5.5rem" : "3.5rem"}}
                    >
                        {header.is_drag && <div className="w-5"/>}
                        {header.is_check && (
                            <Checkbox
                                checked={
                                    table.getIsAllPageRowsSelected() ||
                                    (table.getIsSomePageRowsSelected() && "indeterminate")
                                }
                                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                                aria-label="Select all"
                            />
                        )}
                        {header.is_index && <Label>#</Label>}
                    </div>
                ),
                cell: ({row}) => {
                    const rowData = row.original as T;
                    const actionable = actions.filter(isAction);

                    const renderActions = () => {
                        if (actionable.length === 1) {
                            const a = actionable[0];
                            const danger = a.type === "delete" || a.variant === "destructive";
                            return (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    title={a.label}
                                    aria-label={a.label}
                                    onClick={() => a.onClick(rowData)}
                                    className={danger ? "text-red-600 dark:text-red-400 cursor-pointer" : "text-muted-foreground cursor-pointer"}
                                >
                                    {a.icon ? <a.icon className="size-4"/> : <span className="text-xs">{a.label}</span>}
                                </Button>
                            );
                        }

                        if (actionable.length > 1 || actions.some(isSeparator)) {
                            return (
                                <div className="flex justify-end w-full">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="data-[state=open]:bg-muted text-muted-foreground flex size-8 cursor-pointer"
                                                size="icon"
                                                aria-label="Row actions"
                                            >
                                                <IconAdjustmentsAlt/>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-auto ml-10">
                                            {actions.map((a, i) => {
                                                if (isSeparator(a)) return <DropdownMenuSeparator key={`sep-${i}`}/>;
                                                if (isAction(a)) {
                                                    const danger = a.type === "delete" || a.variant === "destructive";
                                                    return (
                                                        <DropdownMenuItem
                                                            key={`${a.label}-${i}`}
                                                            onClick={() => a.onClick(rowData)}
                                                            className={
                                                                danger
                                                                    ? "cursor-pointer text-red-600 dark:text-red-400 data-[highlighted]:bg-red-50 dark:data-[highlighted]:bg-red-950/40"
                                                                    : "cursor-pointer"
                                                            }
                                                        >
                                                            {a.icon && (
                                                                <a.icon
                                                                    className={`mr-2 size-4 ${danger ? "text-red-600 dark:text-red-400" : ""}`}
                                                                />
                                                            )}
                                                            {a.label}
                                                        </DropdownMenuItem>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            );
                        }

                        return null;
                    };

                    return (
                        <div
                            className={`flex items-center justify-center space-x-2 ${
                                !header.is_drag ? "pl-5" : "px-0"
                            }`}
                            style={{width: header.is_drag ? "5.5rem" : "3.5rem"}}
                        >
                            {renderActions()}

                            {header.is_drag && (
                                <div className="w-5">
                                    <DragHandle id={rowIdFn(row.original)}/>
                                </div>
                            )}

                            {header.is_check && (
                                <Checkbox
                                    checked={row.getIsSelected()}
                                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                                    aria-label="Select row"
                                />
                            )}

                            {header.is_index && (
                                <Label>
                                    {((pagination?.pageIndex ?? 0) - 1) * (pagination?.pageSize ?? 0) +
                                        row.index +
                                        1}
                                </Label>
                            )}
                        </div>
                    );
                },
            });

        }

        // Data columns
        for (const cfg of header.header) {
            const alignClass = alignToClass[cfg.align];
            const widthStyle = typeof cfg.width === "number" ? {width: `${cfg.width}%`, minWidth: 0} : undefined;

            const sortingFn =
                cfg.type === "currency" || cfg.type === "currency-decimal"
                    ? (rowA: any, rowB: any, colId: string) =>
                        (toNumber(rowA.getValue(colId)) || 0) - (toNumber(rowB.getValue(colId)) || 0)
                    : cfg.type === "boolean"
                        ? (rowA: any, rowB: any, colId: string) => {
                            const a = toBoolean(rowA.getValue(colId));
                            const b = toBoolean(rowB.getValue(colId));
                            const na = a === null ? 2 : a ? 1 : 0; // true > false > null
                            const nb = b === null ? 2 : b ? 1 : 0;
                            return na - nb;
                        }
                        : (rowA: any, rowB: any, colId: string) => textCompare(rowA.getValue(colId), rowB.getValue(colId));

            cols.push({
                id: cfg.mapping,
                accessorKey: cfg.mapping as any,
                enableSorting: cfg.sortable,       // ← เปิด/ปิดด้วย cfg.sortable
                sortingFn,                         //   (tanstack จะเมินถ้า enableSorting=false)
                header: ({column}) => {
                    const sorted = column.getIsSorted(); // 'asc' | 'desc' | false
                    const clickable = cfg.sortable;

                    return (
                        <div
                            // className={`px-3 ${alignClass} w-full select-none ${clickable ? "cursor-pointer" : ""}`}
                            // style={widthStyle}
                            className={`px-3 ${alignClass} w-full text-muted-foreground whitespace-normal break-words`}
                            style={widthStyle}
                            role={clickable ? "button" : undefined}
                            tabIndex={clickable ? 0 : undefined}
                            onClick={clickable ? column.getToggleSortingHandler() : undefined}
                            onKeyDown={
                                clickable
                                    ? (e) => (e.key === "Enter" || e.key === " ") && column.toggleSorting()
                                    : undefined
                            }
                            title={cfg.title}
                        >
                            <div className="inline-flex items-center gap-1">
                                <Label>{cfg.title}</Label>
                                {cfg.sortable && (
                                    <IconArrowsSort
                                        size={12}
                                        className={
                                            sorted === "asc"
                                                ? "text-foreground rotate-180 transition-transform"
                                                : sorted === "desc"
                                                    ? "text-foreground transition-transform"
                                                    : "text-muted-foreground opacity-70"
                                        }
                                    />
                                )}
                            </div>
                        </div>
                    );
                },
                cell: ({row}) => {
                    const raw = (row.original as any)?.[cfg.mapping];
                    let display: React.ReactNode = raw ?? "-";

                    if (cfg.type === "currency") {
                        const n = toNumber(raw);
                        display = intToCurrency(n);
                    } else if (cfg.type === "currency-decimal") {
                        const n = toNumber(raw);
                        display = inToCurrentFloat(n);
                    } else if (cfg.type === "boolean") {
                        const b = toBoolean(raw);
                        display =
                            b === null ? (
                                <span className="text-muted-foreground">-</span>
                            ) : (
                                <Badge variant="outline" className="text-muted-foreground px-1.5">
                                    {b ? (
                                        <IconPointFilled className="mr-1 fill-green-500 dark:fill-green-400"/>
                                    ) : (
                                        <IconPointFilled className="mr-1 fill-red-500 dark:fill-red-400"/>
                                    )}
                                    {b?"Done" : "Not Done"}
                                </Badge>
                            );
                    } else if (cfg.type === "image") {
                        const url = String(raw || "");
                        display = url ? (
                                <img
                                    src={url}
                                    alt={cfg.title ?? "image"}
                                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-border"
                                    draggable={false}
                                />
                        ) : (
                            <>noImage</>
                        );
                    }

                    return (
                        <div
                            className={`px-3 ${alignClass} w-full text-muted-foreground whitespace-normal break-words`}
                            style={widthStyle}
                        >
                            {display}
                        </div>
                    );
                },
            } as ColumnDef<T>);
        }
        return cols;
    }, [actions, header.is_check, header.is_index, header.is_drag, header.header, rowIdFn, pagination?.pageIndex, pagination?.pageSize, textCompare]);

    const isServerPagination = Boolean(pagination);
    const isClientPagination = header.is_pagination && !isServerPagination;

    const table = useReactTable<T>({
        data,
        columns,
        state: {sorting, columnVisibility, rowSelection, columnFilters},
        getRowId: (row) => String(rowIdFn(row)),   // <-- was String(row.id)
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,

        manualPagination: isServerPagination,
        pageCount: isServerPagination
            ? Math.ceil((pagination!.totalRowCount ?? 0) / (pagination!.pageSize ?? 1))
            : undefined,

        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: isClientPagination ? getPaginationRowModel() : undefined,
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    });

    function handleDragEnd(event: DragEndEvent) {
        const {active, over} = event;
        if (!over) return;
        if (String(active.id) !== String(over.id)) {
            setData((prev) => {
                const oldIndex = prev.findIndex((d) => String(rowIdFn(d)) === String(active.id));
                const newIndex = prev.findIndex((d) => String(rowIdFn(d)) === String(over.id));
                return arrayMove(prev, oldIndex, newIndex);
            });
        }
    }

    const visibleIds = table.getRowModel().rows.map((r) => rowIdFn(r.original));
    const totalRowDisplay = header.is_pagination && pagination ? (pagination.totalRowCount ?? data.length) : data.length;
    return (
        <div className="w-full flex-col justify-start gap-2">
            <div className="relative flex flex-col gap-4 overflow-auto ">
                <div className="overflow-hidden rounded-lg border">
                    <DndContext
                        collisionDetection={closestCenter}
                        modifiers={[restrictToVerticalAxis]}
                        onDragEnd={handleDragEnd}
                        sensors={sensors}
                        id={sortableId}
                    >
                        <Table>
                            <TableHeader className="bg-muted sticky top-0">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id} colSpan={header.colSpan}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>

                            <TableBody>
                                {table.getRowModel().rows.length ? (
                                    <SortableContext items={visibleIds} strategy={verticalListSortingStrategy}>
                                        {table.getRowModel().rows.map((row) => (
                                            <DraggableRow key={row.id} row={row}/>
                                        ))}
                                    </SortableContext>
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            dataEmpty
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </DndContext>
                </div>

                {(header.is_pagination || header.is_check) ? (
                    <div className="flex items-center justify-between px-4">
                        <div>
                            {header.is_check && (
                                <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                                    {table.getFilteredSelectedRowModel().rows.length}  of {" "}
                                    {totalRowDisplay}  total
                                </div>
                            )}
                        </div>

                        {header.is_pagination && (
                            <div className="flex w-full items-center gap-8 lg:w-fit">
                                <div className="hidden items-center gap-2 lg:flex">
                                    <Label htmlFor="rows-per-page" className="text-sm font-medium">
                                        limitPerPage
                                    </Label>
                                    <Select
                                        value={`${pagination?.pageSize}`}
                                        onValueChange={(value:any) => pagination?.onPageSizeChange(Number(value))}
                                    >
                                        <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                                            <SelectValue placeholder={table.getState().pagination.pageSize}/>
                                        </SelectTrigger>
                                        <SelectContent side="top">
                                            {pageLimit.map((pageSize) => (
                                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                                    {pageSize}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex w-fit items-center justify-center text-sm font-medium">
                                    page {pagination?.pageIndex ?? 1} from {pagination?.totalPage ?? "-"}
                                </div>

                                <div className="ml-auto flex items-center gap-2 lg:ml-0">
                                    <Button
                                        variant="outline"
                                        className="hidden h-8 w-8 p-0 lg:flex"
                                        onClick={pagination?.onFirstPage}
                                        disabled={pagination?.pageIndex === 1}
                                    >
                                        <span className="sr-only">Go to first page</span>
                                        <IconChevronsLeft/>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="size-8"
                                        size="icon"
                                        onClick={pagination?.onPreviousPage}
                                        disabled={pagination?.pageIndex === 1}
                                    >
                                        <span className="sr-only">Go to previous page</span>
                                        <IconChevronLeft/>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="size-8"
                                        size="icon"
                                        onClick={pagination?.onNextPage}
                                        disabled={pagination?.pageIndex === pagination?.totalPage}
                                    >
                                        <span className="sr-only">Go to next page</span>
                                        <IconChevronRight/>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="hidden size-8 lg:flex"
                                        size="icon"
                                        onClick={pagination?.onLastPage}
                                        disabled={pagination?.pageIndex === pagination?.totalPage}
                                    >
                                        <span className="sr-only">Go to last page</span>
                                        <IconChevronsRight/>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="px-4">
                        <div className="text-muted-foreground text-sm lg:flex">
                            {totalRowDisplay} total
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DataTable
