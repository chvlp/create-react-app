import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Button } from "@/components/ui/button.tsx";
import {useEffect, useState} from "react";
import { DialogSaveTodo, todoDefault } from "@/components/save-dialog.tsx";
import {IconEdit, IconPlus, IconTrashFilled, IconCheckbox} from "@tabler/icons-react";
import {DeleteDialog} from "@/components/delete-dialog.tsx";
import {ConfirmDialog} from "@/components/confirm-dialog.tsx";
import {
    useTodoAddMutation,
    useTodoDeleteMutation,
    useTodoGetQuery,
    useTodoUpdateMutation
} from "@/stores/services/todo.ts";
import LoadingScreen from "@/components/loading-screen.tsx";
import {toast_done, toast_err} from "@/lib/toast.ts";
import {message_validate} from "@/lib/error_valid.ts";
import DataTable, {type ITableActionItem, type ITableHeader, type ITableHeaderItem} from "@/components/data-table.tsx";

export interface ITodo {
    userId: number;
    id: number;
    title: string;
    completed: boolean;
}
const simpleTableHeaderItem: ITableHeaderItem[] = [
    {title: "title", mapping: "title", width: 100, type: "text", align: "left", sortable: true},
    {title: "completed", mapping: "completed", width: 100, type: "boolean", align: "center", sortable: true},
]

// eslint-disable-next-line react-refresh/only-export-components
export const simpleTableHeader: ITableHeader =
    {
        is_drag: false,
        is_check: false,
        is_index: true,
        is_pagination: false,
        header: simpleTableHeaderItem,
    }

export default function App() {
    // state -----------------------------
    const [todoMode, todoModeSet] = useState<"view" | "add" | "edit" | "confirm"| "delete">("add");
    const [todoForm, todoFormSet] = useState<ITodo>(todoDefault);
    const [todoSaveIsShow, todoSaveIsShowSet] = useState<boolean>(false);
    const [todoDeleteIs, todoDeleteIsSet] = useState<boolean>(false);
    const [todoConfirmIs, todoConfirmIsSet] = useState<boolean>(false);
    // state -----------------------------

    // context -----------------------------
    // context -----------------------------

    // redux -----------------------------
    const {
        data:todoData,
        isLoading:todoLoading,
        isError:todoIsError,
        error:todoError,
    } = useTodoGetQuery({})

    const [todoAdd,{
        isLoading:todoAddLoading,
    }] = useTodoAddMutation();

    const [todoUpdate,{
        isLoading:todoUpdateLoading,
    }] = useTodoUpdateMutation();

    const [todoDelete,{
        isLoading:todoDeleteLoading,
    }] = useTodoDeleteMutation();
    // redux -----------------------------

    // function -----------------------------
    const handleOpenAdd = () => {
        todoModeSet("add");
        todoFormSet(todoDefault);
        todoSaveIsShowSet(true);
    };

    const handleSave = async (data: ITodo) => {
        if (todoMode === "delete") {
            const {data: res, error: err}: any = await todoDelete({
                id: data.id,
            });
            if (err !== undefined) {
                toast_err(message_validate(err?.message));
                return;
            }
            if (res !== undefined) {
                toast_done("Delete Success");
            }
            todoDeleteIsSet(false);
            return;
        }
        if (todoMode === "confirm") {
            const {data: res, error: err}: any = await todoUpdate({
                ...data,
                completed: !data.completed,
            });
            if (err !== undefined) {
                toast_err(message_validate(err?.message));
                return;
            }
            if (res !== undefined) {
                toast_done("Confirm Success");
            }
        }
        if (todoMode === "add") {
            const {data: res, error: err}: any = await todoAdd(data);
            if (err !== undefined) {
                toast_err(message_validate(err?.message));
                return;
            }
            if (res !== undefined) {
                toast_done("Add Success");
            }
        }
        if (todoMode === "edit") {
            const {data: res, error: err}: any = await todoUpdate(data);
            if (err !== undefined) {
                console.log(err)
                return;
            }
            if (res !== undefined) {
                toast_done("Update Success");
            }
        }
        todoSaveIsShowSet(false);
    };
    //action-menu ----------------------------------------------
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
            label: "Confirm",
            icon: IconCheckbox,
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
                todoDeleteIsSet(true)
            },
        },
    ];
    //action-menu ----------------------------------------------

    //useEffect ----------------------------------------------
    useEffect(() => {
        if (todoIsError){
            toast_err(message_validate(todoError));
        }
    },[todoIsError,todoError]);
    //useEffect ----------------------------------------------

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
                    {todoLoading ?(
                        <LoadingScreen/>
                    ):(
                        <DataTable<ITodo>
                            header={simpleTableHeader}
                            data={(todoData ?? []) as ITodo[]}
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
                onClose={()=>todoSaveIsShowSet(false)}
                isLoading={todoAddLoading || todoUpdateLoading}
            />

            <DeleteDialog
                isOpen={todoDeleteIs}
                isLoading={todoDeleteLoading}
                onClose={() => todoDeleteIsSet(false)}
                onClick={()=>handleSave(todoForm)}
            />

            <ConfirmDialog
                isOpen={todoConfirmIs}
                isLoading={false}
                onClose={() => todoConfirmIsSet(false)}
                onClick={()=>handleSave(todoForm)}
            />
        </div>
    );
}
