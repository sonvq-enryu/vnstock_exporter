import { NextRequest, NextResponse } from "next/server";
import type {
  StockRequest,
  StockResponse,
  StockRecord,
  StockError,
  StockSource,
} from "@/lib/types";
import { fetchVndirect } from "@/lib/sources/vndirect";
import { fetchSsi } from "@/lib/sources/ssi";
import { fetchDnse } from "@/lib/sources/dnse";

function inferErrorSource(source: unknown): StockSource {
  if (source === "vndirect") return "vndirect";
  if (source === "ssi") return "ssi";
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
  if (!normalizeDateInput(body.startDate)) {
    return "Ngày bắt đầu không hợp lệ (DD/MM/YYYY hoặc YYYY-MM-DD)";
  }
  if (!normalizeDateInput(body.endDate)) {
    return "Ngày kết thúc không hợp lệ (DD/MM/YYYY hoặc YYYY-MM-DD)";
  }
  if (!["vndirect", "ssi", "dnse", "both"].includes(body.source)) {
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

    const startDate = normalizeDateInput(body.startDate)!;
    const endDate = normalizeDateInput(body.endDate)!;
    const { symbols, source } = body;
    const allRecords: StockRecord[] = [];
    const allErrors: StockError[] = [];

    const tasks: Promise<{ records: StockRecord[]; error?: StockError }>[] = [];

    for (const symbol of symbols) {
      if (source === "vndirect" || source === "both") {
        tasks.push(fetchVndirect(symbol, startDate, endDate));
      }
      if (source === "ssi" || source === "both") {
        tasks.push(fetchSsi(symbol, startDate, endDate));
      }
      if (source === "dnse" || source === "both") {
        tasks.push(fetchDnse(symbol, startDate, endDate));
      }
    }

    const results = await Promise.allSettled(tasks);

    for (const result of results) {
      if (result.status === "fulfilled") {
        allRecords.push(...result.value.records);
        if (result.value.error) {
          allErrors.push(result.value.error);
        }
      } else {
        allErrors.push({
          symbol: "",
          source: inferErrorSource(source),
          message: result.reason?.message || "Lỗi không xác định",
        });
      }
    }

    // Sort by date descending
    allRecords.sort((a, b) => {
      const [da, ma, ya] = a.date.split("/").map(Number);
      const [db, mb, yb] = b.date.split("/").map(Number);
      const dateA = new Date(ya, ma - 1, da);
      const dateB = new Date(yb, mb - 1, db);
      return dateB.getTime() - dateA.getTime();
    });

    const response: StockResponse = { data: allRecords, errors: allErrors };
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
