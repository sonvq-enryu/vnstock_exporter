export type StockSource = "vndirect" | "dnse";
export type RequestSource = StockSource | "both";
export type RequestMode = "dateRange" | "monthRange";

export interface StockRecord {
  symbol: string;
  companyName: string;
  exchange: "HOSE" | "HNX" | "UPCOM" | "";
  date: string; // DD/MM/YYYY
  openPrice: number; // VND
  highPrice: number; // VND
  lowPrice: number; // VND
  closePrice: number; // VND
  volume: number;
  source: StockSource;
}

export interface StockRequest {
  symbols: string[];
  startDate: string; // DD/MM/YYYY for dateRange, MM/YYYY for monthRange
  endDate: string; // DD/MM/YYYY for dateRange, MM/YYYY for monthRange
  source: RequestSource;
  mode: RequestMode;
}

export interface StockError {
  symbol: string;
  source: StockSource;
  message: string;
}

export interface StockResponse {
  data: StockRecord[];
  errors: StockError[];
}
