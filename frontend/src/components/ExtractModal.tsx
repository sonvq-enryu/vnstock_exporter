"use client";

import React, { useState } from "react";

interface ExtractModalProps {
  onClose: () => void;
}

export default function ExtractModal({ onClose }: ExtractModalProps) {
  const [selectedFormat, setSelectedFormat] = useState("csv");

  return (
    <div className="fixed inset-0 z-40 bg-[#F4F3EF]/90 dark:bg-[#101922]/90 backdrop-blur-[1px] flex items-center justify-center p-4">
      <div
        className="bg-surface dark:bg-slate-900 w-full max-w-[400px] border border-primary shadow-2xl relative flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-primary dark:text-slate-100 hover:text-primary/70 transition-colors cursor-pointer p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <div className="px-8 pt-8 pb-6 border-b border-muted dark:border-slate-800">
          <h2 className="text-[32px] font-display leading-tight tracking-tight text-primary dark:text-slate-100">
            Extract Ledger
          </h2>
          <p className="text-sm mt-2 text-primary/70 dark:text-slate-400">
            Select the destination format for the compiled data.
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
              <span className="text-sm font-medium text-primary dark:text-slate-100 tracking-wide uppercase">CSV</span>
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
              <span className="text-sm font-medium text-primary dark:text-slate-100 tracking-wide uppercase">JSON</span>
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
              <span className="text-sm font-medium text-primary dark:text-slate-100 tracking-wide uppercase">XLSX</span>
            </div>
          </label>
        </div>

        <div className="px-8 pb-8 pt-2">
          <button
            onClick={() => {
              alert(`Downloading as ${selectedFormat.toUpperCase()}...`);
              onClose();
            }}
            className="w-full flex h-12 items-center justify-center bg-primary dark:bg-blue-600 text-surface dark:text-white text-[13px] font-medium uppercase tracking-widest hover:bg-[#333333] dark:hover:bg-blue-700 transition-colors focus:outline-none"
          >
            <span>Download Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
