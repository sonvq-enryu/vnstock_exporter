"use client";

import React, { useState, useMemo } from "react";
import { VI } from "@/lib/vi";
import type { StockRecord } from "@/lib/types";

interface DataGridProps {
  data: StockRecord[];
}

const PAGE_SIZE = 20;

type SortKey = keyof Pick<StockRecord, "date" | "openPrice" | "highPrice" | "lowPrice" | "closePrice" | "volume" | "symbol">;

function formatVND(value: number): string {
  return value.toLocaleString("vi-VN");
}

function formatVolume(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(1) + "K";
  return value.toLocaleString("vi-VN");
}

function parseDateVN(date: string): number {
  const parts = date.split("/");
  if (parts.length !== 3) return 0;
  return new Date(+parts[2], +parts[1] - 1, +parts[0]).getTime();
}

export default function DataGrid({ data }: DataGridProps) {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      let av: number | string = a[sortKey] as number | string;
      let bv: number | string = b[sortKey] as number | string;

      if (sortKey === "date") {
        av = parseDateVN(a.date);
        bv = parseDateVN(b.date);
      }

      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const from = (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, sorted.length);
  const pageData = sorted.slice(from - 1, to);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <span className="ml-1 opacity-30">↕</span>;
    return <span className="ml-1 text-primary">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  const columns: { key: SortKey; label: string; align: "left" | "right"; format: (r: StockRecord) => string }[] = [
    { key: "symbol", label: VI.tableSymbol, align: "left", format: (r) => r.symbol },
    { key: "date", label: VI.tableDate, align: "right", format: (r) => r.date },
    { key: "openPrice", label: VI.tableOpenPrice, align: "right", format: (r) => formatVND(r.openPrice) },
    { key: "highPrice", label: VI.tableHighPrice, align: "right", format: (r) => formatVND(r.highPrice) },
    { key: "lowPrice", label: VI.tableLowPrice, align: "right", format: (r) => formatVND(r.lowPrice) },
    { key: "closePrice", label: VI.tableClosePrice, align: "right", format: (r) => formatVND(r.closePrice) },
    { key: "volume", label: VI.tableVolume, align: "right", format: (r) => formatVolume(r.volume) },
  ];

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500 dark:text-slate-400">{VI.noData}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-right datagrid-table">
          <thead className="sticky top-0 bg-background-light dark:bg-background-dark z-10 border-b-2 border-primary dark:border-blue-500">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`cursor-pointer select-none hover:text-primary transition-colors ${col.align === "left" ? "text-left pl-8" : ""} ${col.key === "volume" ? "pr-8" : ""}`}
                >
                  {col.label}
                  <SortIcon col={col.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono">
            {pageData.map((row, index) => {
              const isGain = row.closePrice > row.openPrice;
              const isLoss = row.closePrice < row.openPrice;
              const priceClass = isGain
                ? "text-green-600 dark:text-green-400"
                : isLoss
                ? "text-red-600 dark:text-red-400"
                : "text-slate-700 dark:text-slate-300";

              return (
                <tr
                  key={index}
                  className="transition-colors duration-150 cursor-default hover:bg-white dark:hover:bg-slate-800"
                >
                  <td className="text-left pl-8 font-semibold text-slate-900 dark:text-slate-100">
                    {row.symbol}
                  </td>
                  <td className="text-slate-700 dark:text-slate-300">{row.date}</td>
                  <td className="text-slate-700 dark:text-slate-300">{formatVND(row.openPrice)}</td>
                  <td className="text-slate-700 dark:text-slate-300">{formatVND(row.highPrice)}</td>
                  <td className="text-slate-700 dark:text-slate-300">{formatVND(row.lowPrice)}</td>
                  <td className={priceClass}>{formatVND(row.closePrice)}</td>
                  <td className="pr-8 text-slate-600 dark:text-slate-400">{formatVolume(row.volume)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-8 py-4 border-t border-slate-200 dark:border-slate-800">
        <span className="text-xs text-slate-500 dark:text-slate-500 font-mono">
          {sorted.length > 0 ? VI.paginationShowing(from, to, sorted.length) : ""}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(1)}
            disabled={currentPage === 1}
            className="pagination-btn"
            aria-label="First page"
          >
            «
          </button>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
            aria-label="Previous page"
          >
            ‹
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`pagination-btn ${currentPage === pageNum ? "pagination-btn-active" : ""}`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
            aria-label="Next page"
          >
            ›
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
            aria-label="Last page"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}
