import type { StockError, StockRecord } from "../types";
import {
  formatDateFromUnix,
  formatDateFromUnknown,
  mapFetchError,
  normalizeDateForQuery,
  normalizePriceVnd,
  parseExchange,
  toUnixSeconds,
} from "./common";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const REQUEST_HEADERS = {
  Accept: "application/json, text/plain, */*",
  "User-Agent": USER_AGENT,
  Referer: "https://dchart.vndirect.com.vn/",
  Origin: "https://dchart.vndirect.com.vn",
};

interface VndirectRecord {
  code?: string;
  date?: string;
  adOpen?: number;
  adClose?: number;
  floor?: string;
  organName?: string;
  companyName?: string;
  exchange?: string;
  open?: number;
  close?: number;
}

interface VndirectResponse {
  data?: VndirectRecord[];
}

interface VndirectDchartResponse {
  t?: number[];
  o?: number[];
  c?: number[];
  s?: string;
  nextTime?: number;
}

function toRecords(
  symbol: string,
  payload: VndirectDchartResponse
): StockRecord[] {
  const ts = payload.t || [];
  const opens = payload.o || [];
  const closes = payload.c || [];
  const size = Math.min(ts.length, opens.length, closes.length);

  const records: StockRecord[] = [];
  for (let i = 0; i < size; i += 1) {
    records.push({
      symbol: symbol.toUpperCase(),
      companyName: "",
      exchange: "",
      date: formatDateFromUnix(ts[i]),
      openPrice: normalizePriceVnd(opens[i]),
      closePrice: normalizePriceVnd(closes[i]),
      source: "vndirect",
    });
  }
  return records;
}

async function fetchJsonWithRetry(url: string, retries = 2): Promise<VndirectDchartResponse> {
  let lastError: unknown;
  for (let i = 0; i <= retries; i += 1) {
    try {
      const res = await fetch(url, {
        headers: REQUEST_HEADERS,
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return (await res.json()) as VndirectDchartResponse;
    } catch (err) {
      lastError = err;
      if (i < retries) {
        await new Promise((r) => setTimeout(r, 400 * (i + 1)));
      }
    }
  }
  throw lastError;
}

async function fetchFromDchart(
  symbol: string,
  startDate: string,
  endDate: string
): Promise<StockRecord[]> {
  const from = toUnixSeconds(startDate);
  // include end day completely
  const to = toUnixSeconds(endDate) + 86400;
  const url =
    `https://dchart-api.vndirect.com.vn/dchart/history` +
    `?symbol=${encodeURIComponent(symbol.toUpperCase())}&resolution=D&from=${from}&to=${to}`;

  const payload = await fetchJsonWithRetry(url);
  return toRecords(symbol, payload);
}

async function fetchFromEntrade(
  symbol: string,
  startDate: string,
  endDate: string
): Promise<StockRecord[]> {
  const from = toUnixSeconds(startDate);
  const to = toUnixSeconds(endDate) + 86400;
  const url =
    `https://services.entrade.com.vn/chart-api/v2/ohlcs/stock` +
    `?symbol=${encodeURIComponent(symbol.toUpperCase())}&resolution=1D&from=${from}&to=${to}`;

  const payload = await fetchJsonWithRetry(url);
  return toRecords(symbol, payload);
}

export async function fetchVndirect(
  symbol: string,
  startDate: string,
  endDate: string
): Promise<{ records: StockRecord[]; error?: StockError }> {
  try {
    try {
      const dchartRecords = await fetchFromDchart(symbol, startDate, endDate);
      if (dchartRecords.length > 0) {
        return { records: dchartRecords };
      }
    } catch {
      // fallback below
    }

    try {
      const entradeRecords = await fetchFromEntrade(symbol, startDate, endDate);
      if (entradeRecords.length > 0) {
        return { records: entradeRecords };
      }
    } catch {
      // fallback below
    }

    // Fallback to previous endpoint in case dchart returns empty.
    const from = normalizeDateForQuery(startDate);
    const to = normalizeDateForQuery(endDate);
    const query = [
      `code:${symbol.toUpperCase()}`,
      `date:gte:${from}`,
      `date:lte:${to}`,
    ].join("~");

    const url =
      `https://finfo-api.vndirect.com.vn/v4/stock_prices` +
      `?q=${encodeURIComponent(query)}&sort=date&size=10000&page=1`;

    const res = await fetch(url, {
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return {
        records: [],
        error: {
          symbol,
          source: "vndirect",
          message: `HTTP ${res.status}`,
        },
      };
    }

    const payload = (await res.json()) as VndirectResponse;
    const rows = payload.data;
    if (!Array.isArray(rows) || rows.length === 0) {
      return {
        records: [],
        error: {
          symbol,
          source: "vndirect",
          message: "Không có dữ liệu từ VNDirect",
        },
      };
    }

    const records: StockRecord[] = [];
    for (const item of rows) {
      const openRaw = item.adOpen ?? item.open;
      const closeRaw = item.adClose ?? item.close;
      if (openRaw === undefined || closeRaw === undefined) continue;

      const openPrice = normalizePriceVnd(openRaw);
      const closePrice = normalizePriceVnd(closeRaw);
      if (!Number.isFinite(openPrice) || !Number.isFinite(closePrice)) continue;

      const date = formatDateFromUnknown(item.date);
      if (!date) continue;

      records.push({
        symbol: (item.code || symbol).toUpperCase(),
        companyName: item.organName || item.companyName || "",
        exchange: parseExchange(item.floor || item.exchange),
        date,
        openPrice,
        closePrice,
        source: "vndirect",
      });
    }

    if (records.length === 0) {
      return {
        records: [],
        error: {
          symbol,
          source: "vndirect",
          message: "Không phân tích được dữ liệu từ VNDirect",
        },
      };
    }

    return { records };
  } catch (err) {
    return {
      records: [],
      error: {
        symbol,
        source: "vndirect",
        message: mapFetchError(err, "VNDirect"),
      },
    };
  }
}
