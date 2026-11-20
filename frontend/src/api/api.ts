import {
  createApi,
  fetchBaseQuery,
  type Api,
  type BaseQueryFn,
  type CreateApiOptions,
  type EndpointDefinitions,
  type FetchArgs,
  type FetchBaseQueryError,
  type ReactApiModules,
} from "@reduxjs/toolkit/query/react";

const baseUrl =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";
const rawBaseQuery = fetchBaseQuery({ baseUrl, credentials: "include" });
let refreshRequest: Promise<unknown> | null = null;

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  const url = typeof args === "string" ? args : args.url;

  if (result.error?.status === 401 && !url.startsWith("/auth/")) {
    if (!refreshRequest) {
      refreshRequest = Promise.resolve(
        rawBaseQuery(
          { url: "/auth/refresh", method: "POST" },
          api,
          extraOptions,
        ),
      ).finally(() => {
        refreshRequest = null;
      });
    }
    const refreshed = (await refreshRequest) as
      | { error?: FetchBaseQueryError }
      | undefined;
    if (!refreshed?.error) {
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }
  return result;
};

export function queryString(values: object) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  return params.toString();
}

export const createAppApi = <
  Definitions extends EndpointDefinitions,
  ReducerPath extends string = "api",
  TagTypes extends string = never,
>(
  api: Omit<
    CreateApiOptions<
      typeof baseQueryWithReauth,
      Definitions,
      ReducerPath,
      TagTypes
    >,
    "baseQuery"
  >,
): Api<
  typeof baseQueryWithReauth,
  Definitions,
  ReducerPath,
  TagTypes,
  ReactApiModules
> =>
  createApi({
    ...api,
    baseQuery: baseQueryWithReauth,
  });
