"use client";

import React, { FormEvent } from "react";

interface InputFormProps {
  onSubmit: (symbol: string, startDate: string, endDate: string) => void;
}

export default function InputForm({ onSubmit }: InputFormProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const symbol = formData.get("symbol") as string;
    const startDate = formData.get("start-date") as string;
    const endDate = formData.get("end-date") as string;
    onSubmit(symbol, startDate, endDate);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <main className="w-full max-w-[640px] px-6" style={{ marginTop: "20vh" }}>
        <header className="mb-12">
          <h1 className="text-[48px] font-normal leading-tight tracking-tight text-slate-900 dark:text-slate-100 mb-2 font-display">
            Equities Data Retrieval
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base font-normal">
            Enter parameters to generate a historical ledger.
          </p>
        </header>

        <form className="flex flex-col gap-8 w-full" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label
              className="text-xs font-medium tracking-widest uppercase text-slate-800 dark:text-slate-300 mb-2 font-sans-tabular"
              htmlFor="symbol"
            >
              Symbol
            </label>
            <input
              autoComplete="off"
              className="editorial-input w-full text-lg uppercase placeholder:text-slate-400 dark:placeholder:text-slate-500 font-sans-tabular"
              id="symbol"
              name="symbol"
              placeholder="e.g., MSFT"
              required
              type="text"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-8 w-full">
            <div className="flex flex-col flex-1">
              <label
                className="text-xs font-medium tracking-widest uppercase text-slate-800 dark:text-slate-300 mb-2 font-sans-tabular"
                htmlFor="start-date"
              >
                Start Date
              </label>
              <input
                className="editorial-input w-full text-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono"
                id="start-date"
                name="start-date"
                pattern="\d{2}/\d{2}/\d{4}"
                placeholder="MM/DD/YYYY"
                required
                type="text"
              />
            </div>
            <div className="flex flex-col flex-1">
              <label
                className="text-xs font-medium tracking-widest uppercase text-slate-800 dark:text-slate-300 mb-2 font-sans-tabular"
                htmlFor="end-date"
              >
                End Date
              </label>
              <input
                className="editorial-input w-full text-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono"
                id="end-date"
                name="end-date"
                pattern="\d{2}/\d{2}/\d{4}"
                placeholder="MM/DD/YYYY"
                required
                type="text"
              />
            </div>
          </div>

          <div className="mt-4 w-full">
            <button
              className="w-full h-[48px] bg-primary hover:bg-primary/90 text-white text-[13px] font-medium tracking-widest uppercase transition-colors duration-200 font-sans-tabular rounded"
              type="submit"
            >
              Compile Ledger
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
