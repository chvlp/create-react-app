import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ITodo } from "@/App.tsx";
import { useEffect, useState } from "react";
import * as React from "react";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {toast_err} from "@/lib/toast.ts";

export interface IDialog {
    title: string;
    todoData: ITodo;
    isOpen: boolean;
    isLoading:boolean;
    onSave: (todo: ITodo) => void;
    onClose: () => void;
}
// eslint-disable-next-line react-refresh/only-export-components
export const todoDefault: ITodo = {
    userId:0,
    id: 0,
    title: "",
    completed: false,
};

export function DialogSaveTodo({ title, todoData, isOpen, onSave, onClose ,isLoading}: IDialog) {
    const [todoForm, todoFormSet] = useState<ITodo>(todoDefault);

    useEffect(() => {
        todoFormSet({ ...todoData });
    }, [todoData, isOpen]);

    const handleSave = async (value?: React.FormEvent) => {
        value?.preventDefault();
        if (!todoForm.title || todoForm.title.trim() === "") {
            toast_err("Please input a title");
            return;
        }

        const payload: ITodo = {
            ...todoForm,
            title: todoForm.title.trim(),
        };
        onSave(payload);
    };

    const handleOnChange = (el: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = el.target;
        todoFormSet((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckedChange = (checked: boolean ) => {
        todoFormSet((prev) => ({ ...prev, completed: checked }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <form onSubmit={handleSave}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader className="pb-6">
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label>title</Label>
                            <Input
                                name="title"
                                placeholder="Please enter title"
                                value={todoForm.title}
                                onChange={handleOnChange}
                                autoFocus
                            />
                        </div>

                        <div className="grid gap-3 py-2">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="completed"
                                    checked={todoForm.completed}
                                    onCheckedChange={handleCheckedChange}
                                    className="w-5 h-5 border rounded flex items-center justify-center"
                                />
                                <label htmlFor="completed" className="text-sm select-none">
                                    Checked for Completed
                                </label>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button className={"cursor-pointer"} onClick={onClose} type="button">Cancel</Button>
                        </DialogClose>
                        <Button disabled={isLoading} className={"cursor-pointer"}onClick={handleSave}>
                            {isLoading ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}
