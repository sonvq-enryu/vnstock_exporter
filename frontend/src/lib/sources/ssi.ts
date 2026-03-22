import type { StockError, StockRecord } from "../types";
import {
  formatDateFromUnix,
  mapFetchError,
  normalizePriceVnd,
  parseExchange,
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

interface DchartResponse {
  t?: number[];
  o?: number[];
  h?: number[];
  l?: number[];
  c?: number[];
  v?: number[];
  s?: string;
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
  const payload = (await res.json()) as DchartResponse;

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
      source: "ssi",
    });
  }
  return records;
}

interface SsiObjectRecord {
  symbol?: string;
  stockCode?: string;
  date?: string;
  tradingDate?: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  floor?: string;
  exchange?: string;
  companyName?: string;
}

interface SsiArrayData {
  t?: number[];
  o?: number[];
  h?: number[];
  l?: number[];
  c?: number[];
  v?: number[];
  floor?: string;
  exchange?: string;
  companyName?: string;
}

interface SsiResponse {
  code?: string;
  message?: string;
  data?: SsiObjectRecord[] | SsiArrayData | null;
}

export async function fetchSsi(
  symbol: string,
  startDate: string,
  endDate: string,
  useFallback = true
): Promise<{ records: StockRecord[]; error?: StockError }> {
  const from = toUnixSeconds(startDate);
  const to = toUnixSeconds(endDate) + 86400;

  // Try SSI API first
  try {
    const url =
      `https://iboard-query.ssi.com.vn/stock/history` +
      `?symbol=${encodeURIComponent(symbol.toUpperCase())}&resolution=D&from=${from}&to=${to}`;

    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const payload = (await res.json()) as SsiResponse;

      if (Array.isArray(payload.data) && payload.data.length > 0) {
        const records: StockRecord[] = [];
        for (const item of payload.data) {
          if (item.open === undefined || item.close === undefined) continue;
          const dateRaw = item.date || item.tradingDate;
          if (!dateRaw) continue;
          const openPrice = normalizePriceVnd(item.open);
          const closePrice = normalizePriceVnd(item.close);
          records.push({
            symbol: (item.symbol || item.stockCode || symbol).toUpperCase(),
            companyName: item.companyName || "",
            exchange: parseExchange(item.floor || item.exchange),
            date: dateRaw.includes("-")
              ? `${dateRaw.slice(8, 10)}/${dateRaw.slice(5, 7)}/${dateRaw.slice(0, 4)}`
              : dateRaw,
            openPrice,
            highPrice: item.high !== undefined ? normalizePriceVnd(item.high) : Math.max(openPrice, closePrice),
            lowPrice: item.low !== undefined ? normalizePriceVnd(item.low) : Math.min(openPrice, closePrice),
            closePrice,
            volume: item.volume ?? 0,
            source: "ssi",
          });
        }
        if (records.length > 0) return { records };
      } else if (payload.data && !Array.isArray(payload.data)) {
        const data = payload.data as SsiArrayData;
        const ts = data.t || [];
        const opens = data.o || [];
        const highs = data.h || [];
        const lows = data.l || [];
        const closes = data.c || [];
        const volumes = data.v || [];
        const size = Math.min(ts.length, opens.length, closes.length);

        const records: StockRecord[] = [];
        for (let i = 0; i < size; i += 1) {
          const open = normalizePriceVnd(opens[i]);
          const close = normalizePriceVnd(closes[i]);
          records.push({
            symbol: symbol.toUpperCase(),
            companyName: data.companyName || "",
            exchange: parseExchange(data.floor || data.exchange),
            date: formatDateFromUnix(ts[i]),
            openPrice: open,
            highPrice: highs[i] !== undefined ? normalizePriceVnd(highs[i]) : Math.max(open, close),
            lowPrice: lows[i] !== undefined ? normalizePriceVnd(lows[i]) : Math.min(open, close),
            closePrice: close,
            volume: volumes[i] || 0,
            source: "ssi",
          });
        }
        if (records.length > 0) return { records };
      }
    }
  } catch {
    // SSI failed — fallback to dchart below
  }

  if (!useFallback) {
    return {
      records: [],
      error: { symbol, source: "ssi", message: "Không có dữ liệu từ SSI" },
    };
  }

  // Fallback: use VNDirect dchart (SSI API currently requires authentication)
  try {
    const records = await fetchFromDchart(symbol, from, to);
    if (records.length > 0) return { records };

    return {
      records: [],
      error: { symbol, source: "ssi", message: "Không có dữ liệu" },
    };
  } catch (err) {
    return {
      records: [],
      error: { symbol, source: "ssi", message: mapFetchError(err, "SSI") },
    };
  }
}
