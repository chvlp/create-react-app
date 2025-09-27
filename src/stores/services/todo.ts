import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

export const todoAPI = createApi({
    reducerPath: "todoStore",
    tagTypes: ["todoStore"],
    baseQuery: fetchBaseQuery({
        baseUrl: "https://jsonplaceholder.typicode.com/",
    }),
    endpoints: (builder) => ({
        todoGet: builder.query({
            query: (body: any) => ({
                url: `todos`,
                method: 'GET',
                params: body,
            }),
            providesTags: ['todoStore'],
        }),
        todoAdd: builder.mutation({
            query: (body: any) => ({
                url: `todos`,
                method: 'POST',
                body: body,
            }),
            invalidatesTags: ['todoStore'],
        }),
        todoUpdate: builder.mutation({
            query: (body: any) => ({
                url: `todos/${body?.id}`,
                method: 'PATCH',
                body: body,
            }),
            invalidatesTags: ['todoStore'],
        }),
        todoDelete: builder.mutation({
            query: (body: any) => ({
                url: `todos/${body?.id}`,
                method: "DELETE",
                params: {},
            }),
            invalidatesTags: ["todoStore"],
        }),
    }),
});
export const {
    useTodoGetQuery,
    useTodoAddMutation,
    useTodoUpdateMutation,
    useTodoDeleteMutation,
} = todoAPI;
