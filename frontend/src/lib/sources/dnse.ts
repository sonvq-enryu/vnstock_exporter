import type { StockError, StockRecord } from "../types";
import {
  formatDateFromUnix,
  mapFetchError,
  normalizePriceVnd,
  toUnixSeconds,
} from "./common";

interface DnseResponse {
  t?: number[];
  o?: number[];
  c?: number[];
}

export async function fetchDnse(
  symbol: string,
  startDate: string,
  endDate: string
): Promise<{ records: StockRecord[]; error?: StockError }> {
  try {
    const from = toUnixSeconds(startDate);
    const to = toUnixSeconds(endDate);
    const url =
      `https://services.entrade.com.vn/chart-api/v2/ohlcs/stock` +
      `?from=${from}&to=${to}&symbol=${encodeURIComponent(symbol.toUpperCase())}&resolution=1D`;

    const res = await fetch(url, {
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return {
        records: [],
        error: {
          symbol,
          source: "dnse",
          message: `HTTP ${res.status}`,
        },
      };
    }

    const payload = (await res.json()) as DnseResponse;
    const ts = payload.t || [];
    const opens = payload.o || [];
    const closes = payload.c || [];
    const size = Math.min(ts.length, opens.length, closes.length);

    if (size === 0) {
      return {
        records: [],
        error: {
          symbol,
          source: "dnse",
          message: "Không có dữ liệu từ DNSE",
        },
      };
    }

    const records: StockRecord[] = [];
    for (let i = 0; i < size; i += 1) {
      records.push({
        symbol: symbol.toUpperCase(),
        companyName: "",
        exchange: "",
        date: formatDateFromUnix(ts[i]),
        openPrice: normalizePriceVnd(opens[i]),
        closePrice: normalizePriceVnd(closes[i]),
        source: "dnse",
      });
    }

    return { records };
  } catch (err) {
    return {
      records: [],
      error: {
        symbol,
        source: "dnse",
        message: mapFetchError(err, "DNSE"),
      },
    };
  }
}
