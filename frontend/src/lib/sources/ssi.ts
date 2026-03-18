import type { StockError, StockRecord } from "../types";
import {
  formatDateFromUnix,
  mapFetchError,
  normalizePriceVnd,
  parseExchange,
  toUnixSeconds,
} from "./common";

interface SsiObjectRecord {
  symbol?: string;
  stockCode?: string;
  date?: string;
  tradingDate?: string;
  open?: number;
  close?: number;
  floor?: string;
  exchange?: string;
  companyName?: string;
}

interface SsiArrayData {
  t?: number[];
  o?: number[];
  c?: number[];
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
  endDate: string
): Promise<{ records: StockRecord[]; error?: StockError }> {
  try {
    const from = toUnixSeconds(startDate);
    const to = toUnixSeconds(endDate);
    const url =
      `https://iboard-query.ssi.com.vn/stock/history` +
      `?symbol=${encodeURIComponent(symbol.toUpperCase())}&resolution=D&from=${from}&to=${to}`;

    const res = await fetch(url, {
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return {
        records: [],
        error: {
          symbol,
          source: "ssi",
          message: `HTTP ${res.status}`,
        },
      };
    }

    const payload = (await res.json()) as SsiResponse;
    if (!payload.data) {
      return {
        records: [],
        error: {
          symbol,
          source: "ssi",
          message: "Không có dữ liệu từ SSI",
        },
      };
    }

    if (Array.isArray(payload.data)) {
      const records: StockRecord[] = [];
      for (const item of payload.data) {
        if (item.open === undefined || item.close === undefined) continue;
        const dateRaw = item.date || item.tradingDate;
        if (!dateRaw) continue;
        records.push({
          symbol: (item.symbol || item.stockCode || symbol).toUpperCase(),
          companyName: item.companyName || "",
          exchange: parseExchange(item.floor || item.exchange),
          date: dateRaw.includes("-")
            ? `${dateRaw.slice(8, 10)}/${dateRaw.slice(5, 7)}/${dateRaw.slice(0, 4)}`
            : dateRaw,
          openPrice: normalizePriceVnd(item.open),
          closePrice: normalizePriceVnd(item.close),
          source: "ssi",
        });
      }

      if (records.length > 0) return { records };
    } else {
      const ts = payload.data.t || [];
      const opens = payload.data.o || [];
      const closes = payload.data.c || [];
      const size = Math.min(ts.length, opens.length, closes.length);

      const records: StockRecord[] = [];
      for (let i = 0; i < size; i += 1) {
        records.push({
          symbol: symbol.toUpperCase(),
          companyName: payload.data.companyName || "",
          exchange: parseExchange(payload.data.floor || payload.data.exchange),
          date: formatDateFromUnix(ts[i]),
          openPrice: normalizePriceVnd(opens[i]),
          closePrice: normalizePriceVnd(closes[i]),
          source: "ssi",
        });
      }

      if (records.length > 0) return { records };
    }

    return {
      records: [],
      error: {
        symbol,
        source: "ssi",
        message: "Không phân tích được dữ liệu từ SSI",
      },
    };
  } catch (err) {
    return {
      records: [],
      error: {
        symbol,
        source: "ssi",
        message: mapFetchError(err, "SSI"),
      },
    };
  }
}
