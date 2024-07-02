import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import proxy from "../../utils/proxy";
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: proxy }),
  endpoints: (builder) => ({
    postUser: builder.mutation({
      query: (body) => ({
        url: "/auth/signup",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { usePostUserMutation } = apiSlice;
//avg indian male
