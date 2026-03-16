"use client";

import React, { useState } from "react";
import InputForm from "../components/InputForm";
import LoadingTerminal from "../components/LoadingTerminal";
import ReportLedger from "../components/ReportLedger";

type ViewState = "INPUT" | "LOADING" | "REPORT";

export default function Home() {
  const [view, setView] = useState<ViewState>("INPUT");
  const [symbol, setSymbol] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleInputSubmit = (s: string, start: string, end: string) => {
    setSymbol(s);
    setStartDate(start);
    setEndDate(end);
    setView("LOADING");
  };

  const handleLoadingComplete = () => {
    setView("REPORT");
  };

  return (
    <>
      {view === "INPUT" && (
        <InputForm onSubmit={handleInputSubmit} />
      )}
      {view === "LOADING" && (
        <LoadingTerminal symbol={symbol} onComplete={handleLoadingComplete} />
      )}
      {view === "REPORT" && (
        <ReportLedger symbol={symbol} startDate={startDate} endDate={endDate} />
      )}
    </>
  );
}
