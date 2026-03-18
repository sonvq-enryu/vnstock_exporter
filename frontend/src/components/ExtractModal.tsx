"use client";

import React, { useState } from "react";
import { VI } from "@/lib/vi";
import type { StockRecord } from "@/lib/types";

interface ExtractModalProps {
  data: StockRecord[];
  onClose: () => void;
}

function generateCSV(data: StockRecord[]): string {
  const headers = [
    VI.tableSymbol,
    VI.tableCompanyName,
    VI.tableExchange,
    VI.tableDate,
    VI.tableOpenPrice,
    VI.tableClosePrice,
    VI.tableSource,
  ];
  const rows = data.map((r) =>
    [
      r.symbol,
      `"${r.companyName}"`,
      r.exchange,
      r.date,
      r.openPrice,
      r.closePrice,
      r.source,
    ].join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

function generateJSON(data: StockRecord[]): string {
  return JSON.stringify(data, null, 2);
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExtractModal({ data, onClose }: ExtractModalProps) {
  const [selectedFormat, setSelectedFormat] = useState("csv");

  const handleDownload = () => {
    if (selectedFormat === "csv") {
      downloadFile(generateCSV(data), "chung_khoan.csv", "text/csv");
    } else if (selectedFormat === "json") {
      downloadFile(
        generateJSON(data),
        "chung_khoan.json",
        "application/json"
      );
    } else {
      alert("Xu\u1EA5t XLSX ch\u01B0a \u0111\u01B0\u1EE3c h\u1ED7 tr\u1EE3. Vui l\u00F2ng ch\u1ECDn CSV ho\u1EB7c JSON.");
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#F4F3EF]/90 dark:bg-[#101922]/90 backdrop-blur-[1px] flex items-center justify-center p-4">
      <div className="bg-surface dark:bg-slate-900 w-full max-w-[400px] border border-primary shadow-2xl relative flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-primary dark:text-slate-100 hover:text-primary/70 transition-colors cursor-pointer p-1"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>

        <div className="px-8 pt-8 pb-6 border-b border-muted dark:border-slate-800">
          <h2 className="text-[32px] font-display leading-tight tracking-tight text-primary dark:text-slate-100">
            {VI.extractTitle}
          </h2>
          <p className="text-sm mt-2 text-primary/70 dark:text-slate-400">
            {VI.extractDesc}
          </p>
        </div>

        <div className="p-8 flex flex-col gap-4">
          <label className="group flex items-center gap-4 border border-muted dark:border-slate-700 p-4 cursor-pointer hover:border-primary dark:hover:border-blue-500 transition-colors bg-surface dark:bg-slate-800">
            <input
              checked={selectedFormat === "csv"}
              onChange={() => setSelectedFormat("csv")}
              className="h-4 w-4 border-muted bg-transparent text-primary dark:text-blue-500 focus:ring-primary dark:focus:ring-blue-500 cursor-pointer"
              name="export_format"
              type="radio"
              value="csv"
            />
            <div className="flex grow flex-col">
              <span className="text-sm font-medium text-primary dark:text-slate-100 tracking-wide uppercase">
                CSV
              </span>
            </div>
          </label>

          <label className="group flex items-center gap-4 border border-muted dark:border-slate-700 p-4 cursor-pointer hover:border-primary dark:hover:border-blue-500 transition-colors bg-surface dark:bg-slate-800">
            <input
              checked={selectedFormat === "json"}
              onChange={() => setSelectedFormat("json")}
              className="h-4 w-4 border-muted bg-transparent text-primary dark:text-blue-500 focus:ring-primary dark:focus:ring-blue-500 cursor-pointer"
              name="export_format"
              type="radio"
              value="json"
            />
            <div className="flex grow flex-col">
              <span className="text-sm font-medium text-primary dark:text-slate-100 tracking-wide uppercase">
                JSON
              </span>
            </div>
          </label>

          <label className="group flex items-center gap-4 border border-muted dark:border-slate-700 p-4 cursor-pointer hover:border-primary dark:hover:border-blue-500 transition-colors bg-surface dark:bg-slate-800">
            <input
              checked={selectedFormat === "xlsx"}
              onChange={() => setSelectedFormat("xlsx")}
              className="h-4 w-4 border-muted bg-transparent text-primary dark:text-blue-500 focus:ring-primary dark:focus:ring-blue-500 cursor-pointer"
              name="export_format"
              type="radio"
              value="xlsx"
            />
            <div className="flex grow flex-col">
              <span className="text-sm font-medium text-primary dark:text-slate-100 tracking-wide uppercase">
                XLSX
              </span>
            </div>
          </label>
        </div>

        <div className="px-8 pb-8 pt-2">
          <button
            onClick={handleDownload}
            className="w-full flex h-12 items-center justify-center bg-primary dark:bg-blue-600 text-surface dark:text-white text-[13px] font-medium uppercase tracking-widest hover:bg-[#333333] dark:hover:bg-blue-700 transition-colors focus:outline-none"
          >
            <span>{VI.downloadButton}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
