"use client";

import React, { useState } from "react";
import InputForm from "../components/InputForm";
import LoadingTerminal from "../components/LoadingTerminal";
import ReportLedger from "../components/ReportLedger";
import type { StockRecord, StockError, RequestSource, RequestMode } from "@/lib/types";

type ViewState = "INPUT" | "LOADING" | "REPORT";

export default function Home() {
  const [view, setView] = useState<ViewState>("INPUT");
  const [symbols, setSymbols] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [source, setSource] = useState<RequestSource>("both");
  const [mode, setMode] = useState<RequestMode>("dateRange");
  const [data, setData] = useState<StockRecord[]>([]);
  const [errors, setErrors] = useState<StockError[]>([]);

  const handleInputSubmit = (
    syms: string[],
    start: string,
    end: string,
    src: RequestSource,
    requestMode: RequestMode
  ) => {
    setSymbols(syms);
    setStartDate(start);
    setEndDate(end);
    setSource(src);
    setMode(requestMode);
    setView("LOADING");
  };

  const handleLoadingComplete = (
    records: StockRecord[],
    errs: StockError[]
  ) => {
    setData(records);
    setErrors(errs);
    setView("REPORT");
  };

  const handleLoadingCancel = () => {
    setView("INPUT");
  };

  return (
    <>
      {view === "INPUT" && <InputForm onSubmit={handleInputSubmit} />}
      {view === "LOADING" && (
        <LoadingTerminal
          symbols={symbols}
          startDate={startDate}
          endDate={endDate}
          source={source}
          mode={mode}
          onComplete={handleLoadingComplete}
          onCancel={handleLoadingCancel}
        />
      )}
      {view === "REPORT" && (
        <ReportLedger
          symbols={symbols}
          startDate={startDate}
          endDate={endDate}
          data={data}
          errors={errors}
        />
      )}
    </>
  );
}
