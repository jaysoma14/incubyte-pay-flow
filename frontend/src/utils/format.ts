export function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = error.data;
    if (typeof data === "object" && data !== null && "error" in data) {
      const nested = data.error;
      if (typeof nested === "object" && nested !== null && "message" in nested && typeof nested.message === "string") {
        return nested.message;
      }
    }
    if (typeof data === "string") return data;
  }
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") return error.message;
  return "Something went wrong. Please try again.";
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export function formatMoney(value: string | number | null | undefined, currency?: string | null) {
  if (value === null || value === undefined || !currency) return "—";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}
