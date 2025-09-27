import React, { createContext, useContext, useEffect, useState } from "react";
import todoDataJson from "@/todo_data.json"; // Import as mock data (for demo)
import type { ITodo } from "@/App";

interface ITodoContext {
    todos: ITodo[];
    addTodo: (todo: ITodo) => void;
    updateTodo: (todo: ITodo) => void;
    deleteTodo: (id: number) => void;
    refreshTodos: () => void;
}

const TodoContext = createContext<ITodoContext | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useTodo = () => {
    const context = useContext(TodoContext);
    if (!context) throw new Error("useTodo must be used within TodoProvider");
    return context;
};

export const TodoProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [todos, setTodos] = useState<ITodo[]>([]);

    useEffect(() => {
        setTodos(todoDataJson as ITodo[]);
    }, []);

    const addTodo = (todo: ITodo) => setTodos((prev) => [
        ...prev,
        { ...todo }
    ]);
    const updateTodo = (todo: ITodo) =>
        setTodos((prev) =>
            prev.map((item) => (item.id === todo.id ? { ...item, ...todo } : item))
        );
    const deleteTodo = (id: number) =>
        setTodos((prev) => prev.filter((item) => item.id !== id));
    const refreshTodos = () => setTodos(todoDataJson as ITodo[]);

    return (
        <TodoContext.Provider value={{ todos, addTodo, updateTodo, deleteTodo, refreshTodos }}>
            {children}
        </TodoContext.Provider>
    );
};
