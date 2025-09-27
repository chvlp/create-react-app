import {configureStore} from "@reduxjs/toolkit";

import {todoAPI} from "@/stores/services/todo.ts";

export const store = configureStore({
    reducer: {
        [todoAPI.reducerPath]: todoAPI.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat([
            todoAPI.middleware,
        ]),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
