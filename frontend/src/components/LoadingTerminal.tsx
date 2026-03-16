"use client";

import React, { useEffect, useState } from "react";

interface LoadingTerminalProps {
  symbol: string;
  onComplete: () => void;
}

export default function LoadingTerminal({ symbol, onComplete }: LoadingTerminalProps) {
  const [logs, setLogs] = useState<string[]>([
    "> Initializing secure connection to node..."
  ]);

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    timeouts.push(
      setTimeout(() => {
        setLogs((prev) => [...prev, "> Authenticating credentials... [OK]"]);
      }, 1000)
    );

    timeouts.push(
      setTimeout(() => {
        setLogs((prev) => [...prev, `> Fetching daily intervals for ${symbol.toUpperCase()}...`]);
      }, 2000)
    );

    timeouts.push(
      setTimeout(() => {
        onComplete();
      }, 4000)
    );

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [symbol, onComplete]);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-6 pt-[20vh] pb-12">
          <div className="flex flex-col w-full max-w-[640px]">
            <div className="mb-8">
              <h1 className="text-text-main dark:text-slate-100 text-[32px] font-normal leading-tight tracking-tight">
                Compiling Ledger...
              </h1>
            </div>

            <div className="w-full h-[1px] bg-muted dark:bg-slate-700 mb-8">
              <div className="h-[1px] bg-primary progress-expand"></div>
            </div>

            <div className="flex flex-col gap-3 font-mono text-[12px] tracking-wide">
              {logs.map((log, index) => {
                let logClass = "text-text-main dark:text-slate-300 fade-in-up";
                if (logs.length > index + 2) {
                   logClass = "text-text-main dark:text-slate-300 log-older";
                } else if (logs.length > index + 1) {
                   logClass = "text-text-main dark:text-slate-300 log-old";
                }

                return (
                  <p key={index} className={logClass}>
                    {log}
                  </p>
                );
              })}
              <p className="text-primary fade-in-up" style={{ animationDelay: "0.2s" }}>
                <span className="animate-pulse">_</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
