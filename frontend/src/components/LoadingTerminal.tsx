"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { VI } from "@/lib/vi";
import type { StockRecord, StockError, RequestSource } from "@/lib/types";

interface LoadingTerminalProps {
  symbols: string[];
  startDate: string;
  endDate: string;
  source: RequestSource;
  onComplete: (data: StockRecord[], errors: StockError[]) => void;
  onCancel: () => void;
}

interface LogLine {
  id: number;
  timestamp: string;
  text: string;
  type: "info" | "success" | "error" | "warn";
}

function nowTimestamp(): string {
  const d = new Date();
  return [
    String(d.getHours()).padStart(2, "0"),
    String(d.getMinutes()).padStart(2, "0"),
    String(d.getSeconds()).padStart(2, "0"),
  ].join(":") + "." + String(d.getMilliseconds()).padStart(3, "0");
}

let logIdCounter = 0;

export default function LoadingTerminal({
  symbols,
  startDate,
  endDate,
  source,
  onComplete,
  onCancel,
}: LoadingTerminalProps) {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("INIT");
  const abortRef = useRef<AbortController | null>(null);
  const onCompleteRef = useRef(onComplete);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  const addLog = useCallback((text: string, type: LogLine["type"] = "info") => {
    const line: LogLine = { id: ++logIdCounter, timestamp: nowTimestamp(), text, type };
    setLogs((prev) => [...prev, line]);
  }, []);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    setLogs([]);
    setProgress(0);
    setStatusText("INIT");

    const run = async () => {
      setStatusText("CONNECTING");
      addLog(VI.initConnection, "info");

      addLog(VI.authOk, "success");
      setStatusText("CRAWLING");
      setProgress(10);

      for (const sym of symbols) {
        addLog(VI.fetchingData(sym), "info");
      }

      setProgress(20);

      try {
        const res = await fetch("/api/stock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbols, startDate, endDate, source }),
          signal: controller.signal,
        });

        setProgress(75);

        const result = await res.json();
        const data: StockRecord[] = result.data || [];
        const errors: StockError[] = result.errors || [];

        setProgress(90);
        setStatusText("PROCESSING");

        for (const sym of symbols) {
          const symRecords = data.filter((r: StockRecord) => r.symbol === sym);
          if (symRecords.length > 0) {
            addLog(VI.fetchComplete(sym, symRecords.length), "success");
          }
        }

        for (const err of errors) {
          addLog(VI.fetchError(err.symbol || "?", err.message), "error");
        }

        setProgress(100);
        setStatusText("DONE");
        onCompleteRef.current(data, errors);
      } catch (err) {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : VI.networkError;
        addLog(VI.fetchError("", message), "error");
        setStatusText("ERROR");
        setProgress(100);
        onCompleteRef.current([], [{ symbol: "", source: "vndirect", message }]);
      }
    };

    run();

    return () => {
      controller.abort();
    };
  }, [symbols, startDate, endDate, source, addLog]);

  const handleAbort = () => {
    abortRef.current?.abort();
    onCancel();
  };


  const symbolStr = symbols.join(", ");

  return (
    <div className="terminal-bg fixed inset-0 z-50 flex flex-col font-mono text-[13px] overflow-hidden">
      {/* Top status bar */}
      <div className="terminal-statusbar flex items-center justify-between px-6 py-3 border-b border-[#1a2530] flex-shrink-0">
        <div className="flex items-center gap-6">
          <span className="terminal-text-dim tracking-widest text-[11px] uppercase">
            STOCKTERMINAL
          </span>
          <span className="terminal-text-dim">
            {"//"}
          </span>
          <span className="terminal-text text-[11px] tracking-wider uppercase">
            CRAWLER
          </span>
        </div>
        <div className="flex items-center gap-6 text-[11px] tracking-wider uppercase">
          <span className="terminal-text-dim">TARGET: <span className="terminal-green">{symbolStr}</span></span>
          <span className="terminal-text-dim">RANGE: <span className="terminal-text">{startDate} → {endDate}</span></span>
          <span className={`terminal-status-badge ${statusText === "ERROR" ? "terminal-red" : statusText === "DONE" ? "terminal-green" : "terminal-yellow animate-pulse"}`}>
            ● {statusText}
          </span>
        </div>
      </div>

      {/* Log area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-1">
        {logs.map((log, index) => {
          const isNew = index >= logs.length - 3;
          const colorClass =
            log.type === "success"
              ? "terminal-green"
              : log.type === "error"
              ? "terminal-red"
              : log.type === "warn"
              ? "terminal-yellow"
              : "terminal-text";
          return (
            <div
              key={log.id}
              className={`flex gap-4 terminal-log-line ${isNew ? "terminal-log-new" : "terminal-log-old"}`}
            >
              <span className="terminal-text-dim flex-shrink-0 select-none">[{log.timestamp}]</span>
              <span className={colorClass}>{log.text}</span>
            </div>
          );
        })}
        <div className="flex gap-4 terminal-log-line">
          <span className="terminal-text-dim flex-shrink-0 select-none">[{nowTimestamp()}]</span>
          <span className="terminal-green">
            <span className="animate-pulse">▋</span>
          </span>
        </div>
        <div ref={logsEndRef} />
      </div>

      {/* Bottom bar */}
      <div className="terminal-statusbar border-t border-[#1a2530] px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="terminal-text-dim text-[11px] uppercase tracking-widest">
            {progress < 100 ? "EXTRACTING DATA" : "COMPLETE"}
          </span>
          <div className="flex items-center gap-6">
            <span className="terminal-text-dim text-[11px]">{progress}%</span>
            <button
              onClick={handleAbort}
              className="terminal-text-dim text-[11px] uppercase tracking-widest hover:terminal-red hover:text-[#ef4444] transition-colors cursor-pointer"
            >
              CTRL+C TO ABORT
            </button>
          </div>
        </div>
        <div className="w-full h-[2px] bg-[#1a2530] overflow-hidden rounded">
          <div
            className="h-full terminal-progress-bar transition-all duration-500 ease-out rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
