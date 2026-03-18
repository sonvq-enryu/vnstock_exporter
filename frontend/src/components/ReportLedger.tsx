"use client";

import React, { useState } from "react";
import ExtractModal from "./ExtractModal";
import { VI } from "@/lib/vi";
import type { StockRecord, StockError } from "@/lib/types";

interface ReportLedgerProps {
  symbols: string[];
  startDate: string;
  endDate: string;
  data: StockRecord[];
  errors: StockError[];
}

function formatVND(value: number): string {
  return value.toLocaleString("vi-VN");
}

export default function ReportLedger({
  symbols,
  startDate,
  endDate,
  data,
  errors,
}: ReportLedgerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const highestPrice =
    data.length > 0
      ? Math.max(...data.map((r) => Math.max(r.openPrice, r.closePrice)))
      : 0;
  const lowestPrice =
    data.length > 0
      ? Math.min(...data.map((r) => Math.min(r.openPrice, r.closePrice)))
      : 0;

  return (
    <>
      <div
        className={`flex flex-col min-h-screen ${isModalOpen ? "opacity-40 filter blur-[2px] pointer-events-none" : ""}`}
      >
        <header className="sticky top-0 z-10 h-16 border-b border-muted bg-background-light dark:bg-background-dark dark:border-slate-800 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-2xl font-normal tracking-wide text-text-main dark:text-slate-100">
              {symbols.join(", ")}
            </h1>
            <span className="text-muted dark:text-slate-500">|</span>
            <span className="font-sans text-sm tracking-wide text-text-main dark:text-slate-300">
              {startDate} — {endDate}
            </span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-6 border border-primary dark:border-blue-500 text-primary dark:text-blue-500 font-sans text-xs uppercase tracking-widest hover:bg-primary dark:hover:bg-blue-500 hover:text-surface dark:hover:text-white transition-colors duration-200"
          >
            {VI.extract}
          </button>
        </header>

        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-8 py-3">
            {errors.map((err, i) => (
              <p key={i} className="text-sm text-red-700 dark:text-red-400">
                {err.symbol ? `${err.symbol}: ` : ""}
                {err.message}
              </p>
            ))}
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-[240px] border-r border-muted dark:border-slate-800 bg-background-light dark:bg-background-dark flex-shrink-0 flex flex-col overflow-y-auto">
            <div className="p-8 border-b border-muted dark:border-slate-800">
              <h2 className="font-sans text-xs uppercase tracking-widest text-text-main dark:text-slate-300 mb-2">
                {VI.periodHigh}
              </h2>
              <p className="font-display text-3xl text-text-main dark:text-slate-100">
                {data.length > 0 ? formatVND(highestPrice) : "—"}
              </p>
            </div>
            <div className="p-8 border-b border-muted dark:border-slate-800">
              <h2 className="font-sans text-xs uppercase tracking-widest text-text-main dark:text-slate-300 mb-2">
                {VI.periodLow}
              </h2>
              <p className="font-display text-3xl text-text-main dark:text-slate-100">
                {data.length > 0 ? formatVND(lowestPrice) : "—"}
              </p>
            </div>
            <div className="p-8 border-b border-muted dark:border-slate-800">
              <h2 className="font-sans text-xs uppercase tracking-widest text-text-main dark:text-slate-300 mb-2">
                {VI.recordCount}
              </h2>
              <p className="font-display text-3xl text-text-main dark:text-slate-100">
                {data.length}
              </p>
            </div>
          </aside>

          <main className="flex-1 bg-background-light dark:bg-background-dark overflow-y-auto">
            <div className="w-full">
              {data.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-slate-500 dark:text-slate-400 text-lg">
                    {VI.noData}
                  </p>
                </div>
              ) : (
                <table className="w-full text-right">
                  <thead className="sticky top-0 bg-background-light dark:bg-background-dark z-0 border-b-2 border-primary dark:border-blue-500">
                    <tr>
                      <th className="text-left w-24 pl-8">{VI.tableSymbol}</th>
                      <th className="text-left w-48">{VI.tableCompanyName}</th>
                      <th className="w-24">{VI.tableExchange}</th>
                      <th className="w-32">{VI.tableDate}</th>
                      <th className="w-32">{VI.tableOpenPrice}</th>
                      <th className="w-32">{VI.tableClosePrice}</th>
                      <th className="w-28 pr-8">{VI.tableSource}</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {data.map((row, index) => (
                      <tr
                        key={index}
                        className="transition-colors duration-150 cursor-default hover:bg-white dark:hover:bg-slate-800"
                      >
                        <td className="text-left pl-8 font-semibold text-text-main dark:text-slate-100">
                          {row.symbol}
                        </td>
                        <td className="text-left text-sm dark:text-slate-300">
                          {row.companyName || "—"}
                        </td>
                        <td className="dark:text-slate-300">
                          {row.exchange || "—"}
                        </td>
                        <td className="text-text-main dark:text-slate-100">
                          {row.date}
                        </td>
                        <td className="dark:text-slate-300">
                          {formatVND(row.openPrice)}
                        </td>
                        <td className="dark:text-slate-300">
                          {formatVND(row.closePrice)}
                        </td>
                        <td className="pr-8 text-xs uppercase dark:text-slate-400">
                          {row.source}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="h-24 w-full"></div>
          </main>
        </div>
      </div>

      {isModalOpen && (
        <ExtractModal data={data} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}
