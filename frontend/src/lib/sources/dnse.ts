import type { StockError, StockRecord } from "../types";
import {
  formatDateFromUnix,
  mapFetchError,
  normalizePriceVnd,
  toUnixSeconds,
} from "./common";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const DCHART_HEADERS = {
  Accept: "application/json, text/plain, */*",
  "User-Agent": USER_AGENT,
  Referer: "https://dchart.vndirect.com.vn/",
  Origin: "https://dchart.vndirect.com.vn",
};

interface OhlcvResponse {
  t?: number[];
  o?: number[];
  h?: number[];
  l?: number[];
  c?: number[];
  v?: number[];
  s?: string;
}

function toRecords(symbol: string, payload: OhlcvResponse, source: StockRecord["source"]): StockRecord[] {
  const ts = payload.t || [];
  const opens = payload.o || [];
  const highs = payload.h || [];
  const lows = payload.l || [];
  const closes = payload.c || [];
  const volumes = payload.v || [];
  const size = Math.min(ts.length, opens.length, closes.length);

  const records: StockRecord[] = [];
  for (let i = 0; i < size; i += 1) {
    const open = normalizePriceVnd(opens[i]);
    const close = normalizePriceVnd(closes[i]);
    records.push({
      symbol: symbol.toUpperCase(),
      companyName: "",
      exchange: "",
      date: formatDateFromUnix(ts[i]),
      openPrice: open,
      highPrice: highs[i] !== undefined ? normalizePriceVnd(highs[i]) : Math.max(open, close),
      lowPrice: lows[i] !== undefined ? normalizePriceVnd(lows[i]) : Math.min(open, close),
      closePrice: close,
      volume: volumes[i] || 0,
      source,
    });
  }
  return records;
}

async function fetchFromDchart(symbol: string, from: number, to: number): Promise<StockRecord[]> {
  const url =
    `https://dchart-api.vndirect.com.vn/dchart/history` +
    `?symbol=${encodeURIComponent(symbol.toUpperCase())}&resolution=D&from=${from}&to=${to}`;

  const res = await fetch(url, {
    headers: DCHART_HEADERS,
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const payload = (await res.json()) as OhlcvResponse;
  return toRecords(symbol, payload, "dnse");
}

async function fetchFromEntrade(symbol: string, from: number, to: number): Promise<StockRecord[]> {
  const url =
    `https://services.entrade.com.vn/chart-api/v2/ohlcs/stock` +
    `?from=${from}&to=${to}&symbol=${encodeURIComponent(symbol.toUpperCase())}&resolution=1D`;

  const res = await fetch(url, {
    headers: DCHART_HEADERS,
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const payload = (await res.json()) as OhlcvResponse;
  return toRecords(symbol, payload, "dnse");
}

export async function fetchDnse(
  symbol: string,
  startDate: string,
  endDate: string,
  useFallback = true
): Promise<{ records: StockRecord[]; error?: StockError }> {
  const from = toUnixSeconds(startDate);
  const to = toUnixSeconds(endDate) + 86400;

  try {
    // Try DNSE/entrade endpoint first (may be blocked by server TLS fingerprinting)
    const entradeRecords = await fetchFromEntrade(symbol, from, to);
    if (entradeRecords.length > 0) return { records: entradeRecords };
  } catch {
    // entrade blocked from server-side; fallback to dchart below
  }

  if (!useFallback) {
    return {
      records: [],
      error: { symbol, source: "dnse", message: "Không có dữ liệu từ DNSE" },
    };
  }

  try {
    const records = await fetchFromDchart(symbol, from, to);
    if (records.length > 0) return { records };

    return {
      records: [],
      error: { symbol, source: "dnse", message: "Không có dữ liệu từ DNSE" },
    };
  } catch (err) {
    return {
      records: [],
      error: { symbol, source: "dnse", message: mapFetchError(err, "DNSE") },
    };
  }
}
