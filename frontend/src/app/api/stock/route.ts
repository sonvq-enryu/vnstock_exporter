import { NextRequest, NextResponse } from "next/server";
import type {
  StockRequest,
  StockResponse,
  StockRecord,
  StockError,
  StockSource,
  RequestMode,
} from "@/lib/types";
import { fetchVndirect } from "@/lib/sources/vndirect";
import { fetchDnse } from "@/lib/sources/dnse";

function inferErrorSource(source: unknown): StockSource {
  if (source === "vndirect") return "vndirect";
  if (source === "dnse") return "dnse";
  return "vndirect";
}

function isValidDate(day: number, month: number, year: number): boolean {
  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) return false;
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function normalizeDateInput(input: string | undefined): string | null {
  if (!input) return null;

  const dmy = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    const year = Number(dmy[3]);
    return isValidDate(day, month, year) ? input : null;
  }

  const iso = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    if (!isValidDate(day, month, year)) return null;
    return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
  }

  return null;
}

function normalizeMonthInput(input: string | undefined): { month: number; year: number } | null {
  if (!input) return null;
  const match = input.match(/^(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const month = Number(match[1]);
  const year = Number(match[2]);
  if (!Number.isInteger(month) || !Number.isInteger(year)) return null;
  if (month < 1 || month > 12) return null;
  if (year < 1900 || year > 2100) return null;

  return { month, year };
}

function parseDmyToDate(date: string): Date {
  const [day, month, year] = date.split("/").map(Number);
  return new Date(year, month - 1, day);
}

function formatDmy(day: number, month: number, year: number): string {
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

function toMonthDateWindow(startMonth: string, endMonth: string): { startDate: string; endDate: string } | null {
  const start = normalizeMonthInput(startMonth);
  const end = normalizeMonthInput(endMonth);
  if (!start || !end) return null;

  const startDateObj = new Date(start.year, start.month - 1, 1);
  const endDateObj = new Date(end.year, end.month, 0);

  if (startDateObj.getTime() > endDateObj.getTime()) return null;

  return {
    startDate: formatDmy(1, start.month, start.year),
    endDate: formatDmy(endDateObj.getDate(), end.month, end.year),
  };
}

function sourcePriority(source: StockSource): number {
  return source === "dnse" ? 2 : 1;
}

function dedupeBySymbolAndDate(records: StockRecord[]): StockRecord[] {
  const canonical = new Map<string, StockRecord>();

  for (const record of records) {
    const key = `${record.symbol}|${record.date}`;
    const existing = canonical.get(key);

    if (!existing) {
      canonical.set(key, record);
      continue;
    }

    if (sourcePriority(record.source) > sourcePriority(existing.source)) {
      canonical.set(key, record);
    }
  }

  return Array.from(canonical.values());
}

function pickLatestTradingDateByMonth(records: StockRecord[]): StockRecord[] {
  const latestBySymbolMonth = new Map<string, StockRecord>();

  for (const record of records) {
    const [, month, year] = record.date.split("/");
    const key = `${record.symbol}|${month}|${year}`;
    const existing = latestBySymbolMonth.get(key);

    if (!existing) {
      latestBySymbolMonth.set(key, record);
      continue;
    }

    if (parseDmyToDate(record.date).getTime() > parseDmyToDate(existing.date).getTime()) {
      latestBySymbolMonth.set(key, record);
    }
  }

  return Array.from(latestBySymbolMonth.values());
}

function validateRequest(body: StockRequest): string | null {
  if (!body.symbols || !Array.isArray(body.symbols) || body.symbols.length === 0) {
    return "Cần ít nhất một mã chứng khoán";
  }
  if (body.symbols.length > 10) {
    return "Tối đa 10 mã chứng khoán";
  }
  for (const s of body.symbols) {
    if (!/^[A-Za-z]{1,5}$/.test(s)) {
      return `Mã chứng khoán không hợp lệ: ${s}`;
    }
  }
  const mode: RequestMode = body.mode ?? "dateRange";
  if (!["dateRange", "monthRange"].includes(mode)) {
    return "Chế độ truy xuất không hợp lệ";
  }
  if (mode === "dateRange") {
    const normalizedStartDate = normalizeDateInput(body.startDate);
    const normalizedEndDate = normalizeDateInput(body.endDate);
    if (!normalizedStartDate) {
      return "Ngày bắt đầu không hợp lệ (DD/MM/YYYY hoặc YYYY-MM-DD)";
    }
    if (!normalizedEndDate) {
      return "Ngày kết thúc không hợp lệ (DD/MM/YYYY hoặc YYYY-MM-DD)";
    }
    if (parseDmyToDate(normalizedStartDate).getTime() > parseDmyToDate(normalizedEndDate).getTime()) {
      return "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc";
    }
  } else {
    const normalizedMonthRange = toMonthDateWindow(body.startDate, body.endDate);
    if (!normalizeMonthInput(body.startDate)) {
      return "Tháng bắt đầu không hợp lệ (MM/YYYY)";
    }
    if (!normalizeMonthInput(body.endDate)) {
      return "Tháng kết thúc không hợp lệ (MM/YYYY)";
    }
    if (!normalizedMonthRange) {
      return "Tháng bắt đầu phải nhỏ hơn hoặc bằng tháng kết thúc";
    }
  }
  if (!["vndirect", "dnse", "both"].includes(body.source)) {
    return "Nguồn dữ liệu không hợp lệ";
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body: StockRequest = await request.json();

    const validationError = validateRequest(body);
    if (validationError) {
      return NextResponse.json(
        {
          data: [],
          errors: [
            { symbol: "", source: inferErrorSource(body?.source), message: validationError },
          ],
        },
        { status: 400 }
      );
    }

    const mode: RequestMode = body.mode ?? "dateRange";
    const normalizedDateRange =
      mode === "monthRange"
        ? toMonthDateWindow(body.startDate, body.endDate)
        : {
            startDate: normalizeDateInput(body.startDate)!,
            endDate: normalizeDateInput(body.endDate)!,
          };

    if (!normalizedDateRange) {
      return NextResponse.json(
        {
          data: [],
          errors: [
            {
              symbol: "",
              source: inferErrorSource(body?.source),
              message: "Khoảng thời gian không hợp lệ",
            },
          ],
        },
        { status: 400 }
      );
    }

    const { startDate, endDate } = normalizedDateRange;
    const { symbols, source } = body;
    const allRecords: StockRecord[] = [];
    const allErrors: StockError[] = [];

    const isBoth = source === "both";

    // Process symbols sequentially to avoid rate-limiting on shared endpoints (e.g. dchart).
    // Sources for each symbol still run in parallel.
    for (const symbol of symbols) {
      const symbolTasks: Promise<{ records: StockRecord[]; error?: StockError }>[] = [];

      if (source === "vndirect" || isBoth) {
        symbolTasks.push(fetchVndirect(symbol, startDate, endDate));
      }
      if (source === "dnse" || isBoth) {
        symbolTasks.push(fetchDnse(symbol, startDate, endDate, !isBoth));
      }

      const results = await Promise.allSettled(symbolTasks);

      for (const result of results) {
        if (result.status === "fulfilled") {
          allRecords.push(...result.value.records);
          if (result.value.error) {
            allErrors.push(result.value.error);
          }
        } else {
          allErrors.push({
            symbol,
            source: inferErrorSource(source),
            message: result.reason?.message || "Lỗi không xác định",
          });
        }
      }
    }

    const canonicalRecords = dedupeBySymbolAndDate(allRecords);
    const finalRecords =
      mode === "monthRange"
        ? pickLatestTradingDateByMonth(canonicalRecords)
        : canonicalRecords;

    // Sort by date descending
    finalRecords.sort((a, b) => {
      return parseDmyToDate(b.date).getTime() - parseDmyToDate(a.date).getTime();
    });

    const response: StockResponse = { data: finalRecords, errors: allErrors };
    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json(
      {
        data: [],
        errors: [
          {
            symbol: "",
            source: inferErrorSource((err as { source?: unknown })?.source),
            message: err instanceof Error ? err.message : "Lỗi server",
          },
        ],
      },
      { status: 500 }
    );
  }
}
