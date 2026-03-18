"use client";

import React, { useEffect, useState, useRef } from "react";
import { VI } from "@/lib/vi";
import type { StockRecord, StockError, RequestSource } from "@/lib/types";

interface LoadingTerminalProps {
  symbols: string[];
  startDate: string;
  endDate: string;
  source: RequestSource;
  onComplete: (data: StockRecord[], errors: StockError[]) => void;
}

export default function LoadingTerminal({
  symbols,
  startDate,
  endDate,
  source,
  onComplete,
}: LoadingTerminalProps) {
  const [logs, setLogs] = useState<string[]>([
    `> ${VI.initConnection}`,
  ]);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const addLog = (msg: string) => {
      setLogs((prev) => [...prev, msg]);
    };

    const run = async () => {
      await new Promise((r) => setTimeout(r, 500));
      addLog(`> ${VI.authOk}`);

      for (const sym of symbols) {
        addLog(`> ${VI.fetchingData(sym)}`);
      }

      try {
        const res = await fetch("/api/stock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbols, startDate, endDate, source }),
        });

        const result = await res.json();
        const data: StockRecord[] = result.data || [];
        const errors: StockError[] = result.errors || [];

        for (const sym of symbols) {
          const symRecords = data.filter((r: StockRecord) => r.symbol === sym);
          if (symRecords.length > 0) {
            addLog(`> ${VI.fetchComplete(sym, symRecords.length)}`);
          }
        }

        for (const err of errors) {
          addLog(`> ${VI.fetchError(err.symbol || "?", err.message)}`);
        }

        // Brief pause to let user see results before transitioning
        await new Promise((r) => setTimeout(r, 800));
        onComplete(data, errors);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : VI.networkError;
        addLog(`> ${VI.fetchError("", message)}`);
        await new Promise((r) => setTimeout(r, 1000));
        onComplete([], [
          { symbol: "", source: "vndirect", message },
        ]);
      }
    };

    run();
  }, [symbols, startDate, endDate, source, onComplete]);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-6 pt-[20vh] pb-12">
          <div className="flex flex-col w-full max-w-[640px]">
            <div className="mb-8">
              <h1 className="text-text-main dark:text-slate-100 text-[32px] font-normal leading-tight tracking-tight">
                {VI.loadingTitle}
              </h1>
            </div>

            <div className="w-full h-[1px] bg-muted dark:bg-slate-700 mb-8">
              <div className="h-[1px] bg-primary progress-expand"></div>
            </div>

            <div className="flex flex-col gap-3 font-mono text-[12px] tracking-wide">
              {logs.map((log, index) => {
                let logClass =
                  "text-text-main dark:text-slate-300 fade-in-up";
                if (logs.length > index + 2) {
                  logClass =
                    "text-text-main dark:text-slate-300 log-older";
                } else if (logs.length > index + 1) {
                  logClass =
                    "text-text-main dark:text-slate-300 log-old";
                }

                return (
                  <p key={index} className={logClass}>
                    {log}
                  </p>
                );
              })}
              <p
                className="text-primary fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <span className="animate-pulse">_</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
