export type StockSource = "vndirect" | "ssi" | "dnse";
export type RequestSource = StockSource | "both";

export interface StockRecord {
  symbol: string;
  companyName: string;
  exchange: "HOSE" | "HNX" | "UPCOM" | "";
  date: string; // DD/MM/YYYY
  openPrice: number; // VND
  closePrice: number; // VND
  source: StockSource;
}

export interface StockRequest {
  symbols: string[];
  startDate: string; // DD/MM/YYYY
  endDate: string; // DD/MM/YYYY
  source: RequestSource;
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
