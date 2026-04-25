"use client";

import React, { useState } from "react";
import ExtractModal from "./ExtractModal";
import ResultsOverview from "./ResultsOverview";
import DataGrid from "./DataGrid";
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

type Tab = "overview" | "datagrid";

export default function ReportLedger({
  symbols,
  startDate,
  endDate,
  data,
  errors,
}: ReportLedgerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const highestPrice =
    data.length > 0
      ? Math.max(...data.map((r) => r.highPrice))
      : 0;
  const lowestPrice =
    data.length > 0
      ? Math.min(...data.map((r) => r.lowPrice))
      : 0;

  return (
    <>
      <div
        className={`flex flex-col min-h-screen ${isModalOpen ? "opacity-40 filter blur-[2px] pointer-events-none" : ""}`}
      >
        {/* Header */}
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

        {/* Error banner */}
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
          {/* Left sidebar */}
          <aside className="w-[220px] border-r border-muted dark:border-slate-800 bg-background-light dark:bg-background-dark flex-shrink-0 flex flex-col overflow-y-auto">
            <div className="p-6 border-b border-muted dark:border-slate-800">
              <h2 className="font-sans text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-500 mb-2">
                {VI.periodHigh}
              </h2>
              <p className="font-serif-display text-2xl text-text-main dark:text-slate-100">
                {data.length > 0 ? formatVND(highestPrice) : "—"}
              </p>
            </div>
            <div className="p-6 border-b border-muted dark:border-slate-800">
              <h2 className="font-sans text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-500 mb-2">
                {VI.periodLow}
              </h2>
              <p className="font-serif-display text-2xl text-text-main dark:text-slate-100">
                {data.length > 0 ? formatVND(lowestPrice) : "—"}
              </p>
            </div>
            <div className="p-6 border-b border-muted dark:border-slate-800">
              <h2 className="font-sans text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-500 mb-2">
                {VI.recordCount}
              </h2>
              <p className="font-serif-display text-2xl text-text-main dark:text-slate-100">
                {data.length}
              </p>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 bg-background-light dark:bg-background-dark overflow-y-auto flex flex-col">
            {/* Tab bar */}
            <div className="flex border-b border-muted dark:border-slate-800 px-8 bg-background-light dark:bg-background-dark sticky top-0 z-10">
              {(["overview", "datagrid"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`tab-btn ${activeTab === tab ? "tab-btn-active" : "tab-btn-inactive"}`}
                >
                  {tab === "overview" ? VI.tabOverview : VI.tabDataGrid}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="tab-content flex-1">
              {activeTab === "overview" && <ResultsOverview data={data} />}
              {activeTab === "datagrid" && <DataGrid data={data} />}
            </div>
          </main>
        </div>
      </div>

      {isModalOpen && (
        <ExtractModal data={data} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}
