import React, { createContext, useContext, useEffect, useState } from "react";
import {toast_err} from "@/lib/toast.ts";

export interface ITodo {
    userId: number;
    id: number;
    title: string;
    completed: boolean;
}

interface ITodoContext {
    todos: ITodo[];
    loading: boolean;
    error: any;
    refresh: () => void;
    addTodo: (todo: Omit<ITodo, "id">) => Promise<void>;
    updateTodo: (todo: ITodo) => Promise<void>;
    deleteTodo: (id: number) => Promise<void>;
}

const TodoContext = createContext<ITodoContext | undefined>(undefined);
const baseUrl = "https://jsonplaceholder.typicode.com/";

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [todos, setTodos] = useState<ITodo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any>(null);

    const fetchTodos = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${baseUrl}/todos`,{
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            setTodos(data);
        } catch (err) {
            setError(err);
        }
        setLoading(false);
    };

    useEffect(() => {
         fetchTodos();
    }, []);

    const refresh = () => fetchTodos();

    const addTodo = async (todo: Omit<ITodo, "id">) => {
        setLoading(true);
        try {
            const res = await fetch(`${baseUrl}/todos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(todo),
            });
            const newTodo = await res.json();
            setTodos((prev) => [newTodo, ...prev]);
        } catch (err) {
            setError(err);
        }
        setLoading(false);
    };

    const updateTodo = async (todo: ITodo) => {
        setLoading(true);
        try {
            await fetch(`${baseUrl}/todos/${todo.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(todo),
            });
            setTodos((prev:ITodo[]) => prev.map((t:ITodo):ITodo => (t.id === todo.id ? { ...t, ...todo } : t)));
        } catch (err) {
            setError(err);
        }
        setLoading(false);
    };

    const deleteTodo = async (id: number) => {
        setLoading(true);
        try {
            await fetch(`${baseUrl}/todos/${id}`, {
                method: "DELETE",
            });
            setTodos((prev) => prev.filter((t) => t.id !== id));
        } catch (err) {
            setError(err);
        }
        setLoading(false);
    };

    return (
        <TodoContext.Provider
            value={{
                todos,
                loading,
                error,
                refresh,
                addTodo,
                updateTodo,
                deleteTodo,
            }}
        >
            {children}
        </TodoContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTodoContext = () => {
    const ctx = useContext(TodoContext);
    if (!ctx){
        toast_err("useTodoContext must be used inside TodoProvider")
        throw new Error("useTodoContext must be used inside TodoProvider")
    }
    return ctx;
};
