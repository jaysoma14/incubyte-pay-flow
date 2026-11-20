import { createAppApi } from "./api";
import type { User } from "../types";

export const authApi = createAppApi({
  reducerPath: "authApi",
  endpoints: (builder) => ({
    getMe: builder.query<{ user: User }, void>({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),
    login: builder.mutation<{ user: User }, { email: string; password: string }>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      invalidatesTags: ["Auth"],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: ["Auth"],
    }),
  }),
  tagTypes: ["Auth"],
});

export const { useGetMeQuery, useLoginMutation, useLogoutMutation } = authApi;
