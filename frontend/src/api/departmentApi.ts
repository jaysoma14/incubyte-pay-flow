import { createAppApi } from "./api";
import type { Department } from "../types";

export const departmentApi = createAppApi({
  reducerPath: "departmentApi",
  endpoints: (builder) => ({
    getDepartments: builder.query<{ data: Department[] }, void>({
      query: () => "/departments",
      providesTags: ["Department"],
    }),
  }),
  tagTypes: ["Department"],
});

export const { useGetDepartmentsQuery } = departmentApi;
