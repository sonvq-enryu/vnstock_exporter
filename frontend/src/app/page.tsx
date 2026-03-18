"use client";

import React, { useState } from "react";
import InputForm from "../components/InputForm";
import LoadingTerminal from "../components/LoadingTerminal";
import ReportLedger from "../components/ReportLedger";
import type { StockRecord, StockError, RequestSource } from "@/lib/types";

type ViewState = "INPUT" | "LOADING" | "REPORT";

export default function Home() {
  const [view, setView] = useState<ViewState>("INPUT");
  const [symbols, setSymbols] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [source, setSource] = useState<RequestSource>("both");
  const [data, setData] = useState<StockRecord[]>([]);
  const [errors, setErrors] = useState<StockError[]>([]);

  const handleInputSubmit = (
    syms: string[],
    start: string,
    end: string,
    src: RequestSource
  ) => {
    setSymbols(syms);
    setStartDate(start);
    setEndDate(end);
    setSource(src);
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

  return (
    <>
      {view === "INPUT" && <InputForm onSubmit={handleInputSubmit} />}
      {view === "LOADING" && (
        <LoadingTerminal
          symbols={symbols}
          startDate={startDate}
          endDate={endDate}
          source={source}
          onComplete={handleLoadingComplete}
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
