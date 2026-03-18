import type { StockRecord } from "../types";

export function parseExchange(exchange: string | undefined): StockRecord["exchange"] {
  if (!exchange) return "";
  const upper = exchange.toUpperCase();
  if (upper === "HOSE" || upper === "HSX") return "HOSE";
  if (upper === "HNX") return "HNX";
  if (upper === "UPCOM" || upper === "UPCO") return "UPCOM";
  return "";
}

export function normalizeDateForQuery(input: string): string {
  const dmy = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  return input;
}

export function toUnixSeconds(dateStr: string): number {
  const iso = normalizeDateForQuery(dateStr);
  const [y, m, d] = iso.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d, 0, 0, 0) / 1000);
}

export function formatDateFromUnix(seconds: number): string {
  const d = new Date(seconds * 1000);
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;
}

export function formatDateFromUnknown(input: string | number | undefined): string {
  if (typeof input === "number") return formatDateFromUnix(input);
  if (!input) return "";

  const epochMatch = input.match(/\/Date\((\d+)\)\//);
  if (epochMatch) {
    const seconds = Math.floor(Number(epochMatch[1]) / 1000);
    return formatDateFromUnix(seconds);
  }

  const isoMatch = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;

  const dmyMatch = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmyMatch) return input;

  return "";
}

export function normalizePriceVnd(value: number): number {
  if (!Number.isFinite(value)) return NaN;
  return value < 1000 ? value * 1000 : value;
}

export function mapFetchError(err: unknown, sourceName: string): string {
  if (!(err instanceof Error)) return "Lỗi không xác định";
  const cause = err.cause as { code?: string } | undefined;

  if (err.name === "AbortError" || cause?.code === "UND_ERR_CONNECT_TIMEOUT") {
    return `Không thể kết nối tới ${sourceName} (timeout mạng)`;
  }
  if (cause?.code === "ENOTFOUND") {
    return `Không phân giải được tên miền ${sourceName}`;
  }
  if (cause?.code === "ECONNRESET") {
    return `Kết nối tới ${sourceName} bị ngắt`;
  }
  return err.message || "Lỗi không xác định";
}
