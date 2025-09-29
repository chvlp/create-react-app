import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useEffect, useState } from "react";
import { DialogSaveTodo, todoDefault } from "@/components/save-dialog.tsx";
import { IconEdit, IconPlus, IconTrashFilled, IconToggleRightFilled } from "@tabler/icons-react";
import { DeleteDialog } from "@/components/delete-dialog.tsx";
import { ConfirmDialog } from "@/components/confirm-dialog.tsx";
import LoadingScreen from "@/components/loading-screen.tsx";
import { toast_done, toast_err } from "@/lib/toast.ts";
import { message_validate } from "@/lib/error_valid.ts";
import DataTable, { type ITableActionItem, type ITableHeader, type ITableHeaderItem } from "@/components/data-table.tsx";
import { useTodoContext, type ITodo } from "@/contexts/todo_context.tsx"; // <<== IMPORT

const simpleTableHeaderItem: ITableHeaderItem[] = [
    { title: "title", mapping: "title", width: 100, type: "text", align: "left", sortable: true },
    { title: "completed", mapping: "completed", width: 100, type: "boolean", align: "center", sortable: true },
];

// eslint-disable-next-line react-refresh/only-export-components
export const simpleTableHeader: ITableHeader = {
    is_drag: false,
    is_check: false,
    is_index: true,
    is_pagination: false,
    header: simpleTableHeaderItem,
};

export default function App() {
    // Context API
    const { todos, loading, error, addTodo, updateTodo, deleteTodo, refresh } = useTodoContext();

    // Local UI state
    const [todoMode, todoModeSet] = useState<"view" | "add" | "edit" | "confirm" | "delete">("add");
    const [todoForm, todoFormSet] = useState<ITodo>(todoDefault);
    const [todoSaveIsShow, todoSaveIsShowSet] = useState<boolean>(false);
    const [todoDeleteIs, todoDeleteIsSet] = useState<boolean>(false);
    const [todoConfirmIs, todoConfirmIsSet] = useState<boolean>(false);

    // Action Handlers
    const handleOpenAdd = () => {
        todoModeSet("add");
        todoFormSet(todoDefault);
        todoSaveIsShowSet(true);
    };

    const handleSave = async (data: ITodo) => {
        try {
            if (todoMode === "delete") {
                await deleteTodo(data.id);
                toast_done("Delete Success");
                todoDeleteIsSet(false);
            } else if (todoMode === "confirm") {
                await updateTodo({ ...data, completed: !data.completed });
                toast_done("Confirm Success");
                todoConfirmIsSet(false);
            } else if (todoMode === "add") {
                await addTodo(data);
                toast_done("Add Success");
                todoSaveIsShowSet(false);
            } else if (todoMode === "edit") {
                await updateTodo(data);
                toast_done("Update Success");
                todoSaveIsShowSet(false);
            }
            refresh(); // re-fetch
        } catch (err: any) {
            toast_err(message_validate(err?.message));
        }
    };

    // DataTable Actions
    const menuActionsSimple: ITableActionItem<ITodo>[] = [
        {
            label: "edit",
            icon: IconEdit,
            type: "menu",
            onClick: (data: ITodo) => {
                todoModeSet("edit");
                todoFormSet(data);
                todoSaveIsShowSet(true);
            },
        },
        {
            label: "Toggle",
            icon: IconToggleRightFilled,
            type: "menu",
            onClick: (data: ITodo) => {
                todoModeSet("confirm");
                todoFormSet(data);
                todoConfirmIsSet(true);
            },
        },
        {
            label: "delete",
            icon: IconTrashFilled,
            type: "delete",
            onClick: (data) => {
                todoModeSet("delete");
                todoFormSet(data);
                todoDeleteIsSet(true);
            },
        },
    ];

    useEffect(() => {
        if (error) {
            toast_err(message_validate(error));
        }
    }, [error]);

    return (
        <div>
            <Card>
                <CardHeader>
                    <div className="flex flex-row justify-between items-center">
                        <Label>Todo List</Label>
                        <div className="flex gap-2 items-center">
                            <Button onClick={handleOpenAdd} className={"cursor-pointer"}>
                                <IconPlus className="mr-2" />
                                Add todo
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <LoadingScreen />
                    ) : (
                        <DataTable<ITodo>
                            header={simpleTableHeader}
                            data={todos}
                            actions={menuActionsSimple}
                        />
                    )}
                </CardContent>
            </Card>

            <DialogSaveTodo
                title={"Save todo"}
                todoData={todoForm}
                isOpen={todoSaveIsShow}
                onSave={handleSave}
                onClose={() => todoSaveIsShowSet(false)}
                isLoading={loading}
            />

            <DeleteDialog
                isOpen={todoDeleteIs}
                isLoading={loading}
                onClose={() => todoDeleteIsSet(false)}
                onClick={() => handleSave(todoForm)}
            />

            <ConfirmDialog
                isOpen={todoConfirmIs}
                isLoading={loading}
                onClose={() => todoConfirmIsSet(false)}
                onClick={() => handleSave(todoForm)}
            />
        </div>
    );
}
