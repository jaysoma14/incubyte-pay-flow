export type ReportType = "employees" | "salaries";

export async function downloadCsv(
  type: ReportType,
  filters: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";
  const url = `${baseUrl}/reports/${type}/export?${params.toString()}`;
  let response = await fetch(url, { credentials: "include" });
  if (response.status === 401) {
    const refreshed = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (refreshed.ok) {
      response = await fetch(url, { credentials: "include" });
    }
  }

  if (!response.ok) {
    let message = `Export failed (${response.status}).`;
    try {
      const body = await response.json() as { error?: { message?: string } };
      message = body.error?.message ?? message;
    } catch {
      // The response may be a non-JSON proxy error.
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition");
  const filename = disposition?.match(/filename="?([^";]+)"?/i)?.[1] ?? "payflow-export.csv";
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
