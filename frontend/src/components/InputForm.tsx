"use client";

import React, { FormEvent } from "react";
import { VI } from "@/lib/vi";
import type { RequestSource } from "@/lib/types";

interface InputFormProps {
  onSubmit: (
    symbols: string[],
    startDate: string,
    endDate: string,
    source: RequestSource
  ) => void;
}

export default function InputForm({ onSubmit }: InputFormProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const symbolsRaw = formData.get("symbols") as string;
    const startDate = formData.get("start-date") as string;
    const endDate = formData.get("end-date") as string;
    const source = formData.get("source") as RequestSource;

    const symbols = symbolsRaw
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter((s) => /^[A-Z]{1,5}$/.test(s));

    if (symbols.length === 0) return;
    if (symbols.length > 10) {
      alert("T\u1ED1i \u0111a 10 m\u00E3 ch\u1EE9ng kho\u00E1n");
      return;
    }

    onSubmit(symbols, startDate, endDate, source);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <main className="w-full max-w-[640px] px-6" style={{ marginTop: "20vh" }}>
        <header className="mb-12">
          <h1 className="text-[48px] font-normal leading-tight tracking-tight text-slate-900 dark:text-slate-100 mb-2 font-display">
            {VI.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base font-normal">
            {VI.subtitle}
          </p>
        </header>

        <form className="flex flex-col gap-8 w-full" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label
              className="text-xs font-medium tracking-widest uppercase text-slate-800 dark:text-slate-300 mb-2 font-sans-tabular"
              htmlFor="symbols"
            >
              {VI.symbolLabel}
            </label>
            <input
              autoComplete="off"
              className="editorial-input w-full text-lg uppercase placeholder:text-slate-400 dark:placeholder:text-slate-500 font-sans-tabular"
              id="symbols"
              name="symbols"
              placeholder={VI.symbolPlaceholder}
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
                {VI.startDateLabel}
              </label>
              <input
                className="editorial-input w-full text-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono"
                id="start-date"
                name="start-date"
                pattern="\d{2}/\d{2}/\d{4}"
                placeholder={VI.datePlaceholder}
                required
                type="text"
              />
            </div>
            <div className="flex flex-col flex-1">
              <label
                className="text-xs font-medium tracking-widest uppercase text-slate-800 dark:text-slate-300 mb-2 font-sans-tabular"
                htmlFor="end-date"
              >
                {VI.endDateLabel}
              </label>
              <input
                className="editorial-input w-full text-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono"
                id="end-date"
                name="end-date"
                pattern="\d{2}/\d{2}/\d{4}"
                placeholder={VI.datePlaceholder}
                required
                type="text"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label
              className="text-xs font-medium tracking-widest uppercase text-slate-800 dark:text-slate-300 mb-2 font-sans-tabular"
            >
              {VI.sourceLabel}
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="source"
                  value="both"
                  defaultChecked
                  className="h-4 w-4 text-primary focus:ring-primary cursor-pointer"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {VI.sourceBoth}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="source"
                  value="vndirect"
                  className="h-4 w-4 text-primary focus:ring-primary cursor-pointer"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {VI.sourceVndirect}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="source"
                  value="ssi"
                  className="h-4 w-4 text-primary focus:ring-primary cursor-pointer"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {VI.sourceSsi}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="source"
                  value="dnse"
                  className="h-4 w-4 text-primary focus:ring-primary cursor-pointer"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {VI.sourceDnse}
                </span>
              </label>
            </div>
          </div>

          <div className="mt-4 w-full">
            <button
              className="w-full h-[48px] bg-primary hover:bg-primary/90 text-white text-[13px] font-medium tracking-widest uppercase transition-colors duration-200 font-sans-tabular rounded"
              type="submit"
            >
              {VI.submitButton}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
