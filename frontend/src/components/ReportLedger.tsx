"use client";

import React, { useState } from "react";
import ExtractModal from "./ExtractModal";

interface ReportLedgerProps {
  symbol: string;
  startDate: string;
  endDate: string;
}

export default function ReportLedger({ symbol, startDate, endDate }: ReportLedgerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockData = [
    { date: "2023-12-31", open: "193.90", high: "194.40", low: "191.73", close: "192.53", volume: "42,628,800" },
    { date: "2023-12-30", open: "194.14", high: "194.66", low: "193.17", close: "193.58", volume: "34,049,900" },
    { date: "2023-12-29", open: "193.61", high: "194.40", low: "192.36", close: "193.15", volume: "41,452,100" },
    { date: "2023-12-28", open: "192.49", high: "193.50", low: "191.09", close: "193.05", volume: "34,120,500" },
    { date: "2023-12-27", open: "192.49", high: "193.50", low: "191.09", close: "193.05", volume: "34,120,500" },
    { date: "2023-12-26", open: "193.61", high: "194.40", low: "192.36", close: "193.15", volume: "41,452,100" },
    { date: "2023-12-22", open: "194.14", high: "194.66", low: "193.17", close: "193.58", volume: "34,049,900" },
    { date: "2023-12-21", open: "193.90", high: "194.40", low: "191.73", close: "192.53", volume: "42,628,800" },
  ];

  return (
    <>
      <div className={`flex flex-col min-h-screen ${isModalOpen ? "opacity-40 filter blur-[2px] pointer-events-none" : ""}`}>
        <header className="sticky top-0 z-10 h-16 border-b border-muted bg-background-light dark:bg-background-dark dark:border-slate-800 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-2xl font-normal tracking-wide text-text-main dark:text-slate-100">
              {symbol.toUpperCase()}
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
            Extract
          </button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-[240px] border-r border-muted dark:border-slate-800 bg-background-light dark:bg-background-dark flex-shrink-0 flex flex-col overflow-y-auto">
            <div className="p-8 border-b border-muted dark:border-slate-800">
              <h2 className="font-sans text-xs uppercase tracking-widest text-text-main dark:text-slate-300 mb-2">Period High</h2>
              <p className="font-display text-3xl text-text-main dark:text-slate-100">$198.23</p>
            </div>
            <div className="p-8 border-b border-muted dark:border-slate-800">
              <h2 className="font-sans text-xs uppercase tracking-widest text-text-main dark:text-slate-300 mb-2">Period Low</h2>
              <p className="font-display text-3xl text-text-main dark:text-slate-100">$124.17</p>
            </div>
            <div className="p-8 border-b border-muted dark:border-slate-800">
              <h2 className="font-sans text-xs uppercase tracking-widest text-text-main dark:text-slate-300 mb-2">Average Volume</h2>
              <p className="font-display text-3xl text-text-main dark:text-slate-100">58,420,100</p>
            </div>
          </aside>

          <main className="flex-1 bg-background-light dark:bg-background-dark overflow-y-auto">
            <div className="w-full">
              <table className="w-full text-right">
                <thead className="sticky top-0 bg-background-light dark:bg-background-dark z-0 border-b-2 border-primary dark:border-blue-500">
                  <tr>
                    <th className="text-left w-32 pl-8">Date</th>
                    <th className="w-32">Open</th>
                    <th className="w-32">High</th>
                    <th className="w-32">Low</th>
                    <th className="w-32">Close</th>
                    <th className="w-40 pr-8">Volume</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {mockData.map((row, index) => (
                    <tr key={index} className="transition-colors duration-150 cursor-default hover:bg-white dark:hover:bg-slate-800">
                      <td className="text-left pl-8 text-text-main dark:text-slate-100">{row.date}</td>
                      <td className="dark:text-slate-300">{row.open}</td>
                      <td className="dark:text-slate-300">{row.high}</td>
                      <td className="dark:text-slate-300">{row.low}</td>
                      <td className="dark:text-slate-300">{row.close}</td>
                      <td className="pr-8 dark:text-slate-300">{row.volume}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="h-24 w-full"></div>
          </main>
        </div>
      </div>

      {isModalOpen && (
        <ExtractModal onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}
