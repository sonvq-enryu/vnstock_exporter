"use client";

import React, { useMemo } from "react";
import { VI } from "@/lib/vi";
import type { StockRecord } from "@/lib/types";

interface ResultsOverviewProps {
  data: StockRecord[];
}

function formatVND(value: number): string {
  return value.toLocaleString("vi-VN");
}

function formatVolume(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(1) + "K";
  return value.toLocaleString("vi-VN");
}

interface SparklineProps {
  data: { date: string; value: number }[];
  color?: string;
  width?: number;
  height?: number;
}

function Sparkline({ data, color = "#1173d4", width = 400, height = 120 }: SparklineProps) {
  if (data.length < 2) return null;

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const padX = 0;
  const padY = 8;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * innerW,
    y: padY + innerH - ((d.value - minVal) / range) * innerH,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaD =
    pathD +
    ` L ${points[points.length - 1].x.toFixed(1)} ${(padY + innerH).toFixed(1)}` +
    ` L ${points[0].x.toFixed(1)} ${(padY + innerH).toFixed(1)} Z`;

  const gradId = `grad-${color.replace("#", "")}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export default function ResultsOverview({ data }: ResultsOverviewProps) {
  const stats = useMemo(() => {
    if (data.length === 0) return null;
    const opens = data.map((r) => r.openPrice);
    const closes = data.map((r) => r.closePrice);
    const highs = data.map((r) => r.highPrice);
    const lows = data.map((r) => r.lowPrice);
    const volumes = data.map((r) => r.volume);

    return {
      avgOpen: opens.reduce((a, b) => a + b, 0) / opens.length,
      avgClose: closes.reduce((a, b) => a + b, 0) / closes.length,
      periodHigh: Math.max(...highs),
      periodLow: Math.min(...lows),
      avgVolume: volumes.reduce((a, b) => a + b, 0) / volumes.length,
    };
  }, [data]);

  // Group close prices by date (average if multiple symbols)
  const chartData = useMemo(() => {
    const byDate = new Map<string, number[]>();
    for (const r of data) {
      if (!byDate.has(r.date)) byDate.set(r.date, []);
      byDate.get(r.date)!.push(r.closePrice);
    }
    return Array.from(byDate.entries())
      .map(([date, prices]) => ({
        date,
        value: prices.reduce((a, b) => a + b, 0) / prices.length,
      }))
      .sort((a, b) => {
        // parse DD/MM/YYYY for comparison
        const pa = a.date.split("/");
        const pb = b.date.split("/");
        return (
          new Date(+pa[2], +pa[1] - 1, +pa[0]).getTime() -
          new Date(+pb[2], +pb[1] - 1, +pb[0]).getTime()
        );
      });
  }, [data]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500 dark:text-slate-400">{VI.noData}</p>
      </div>
    );
  }

  const trend = stats.avgClose >= stats.avgOpen;
  const trendPct = stats.avgOpen > 0
    ? (((stats.avgClose - stats.avgOpen) / stats.avgOpen) * 100).toFixed(2)
    : "0.00";

  const statCards = [
    { label: VI.avgOpen, value: formatVND(Math.round(stats.avgOpen)), sub: null },
    { label: VI.avgClose, value: formatVND(Math.round(stats.avgClose)), sub: `${trend ? "+" : ""}${trendPct}%`, subGreen: trend },
    { label: VI.periodHigh, value: formatVND(stats.periodHigh), sub: null },
    { label: VI.periodLow, value: formatVND(stats.periodLow), sub: null },
    { label: VI.avgVolume, value: formatVolume(Math.round(stats.avgVolume)), sub: null },
    { label: VI.recordCount, value: data.length.toString(), sub: null },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Price trend */}
      <div className="flex items-center gap-4">
        <span
          className={`text-[11px] font-mono font-medium tracking-widest uppercase px-2 py-1 rounded ${
            trend
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {trend ? "▲" : "▼"} {trend ? "+" : ""}{trendPct}% vs Avg Open
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-500 font-mono">
          {chartData.length > 0 ? `${chartData[0].date} — ${chartData[chartData.length - 1].date}` : ""}
        </span>
      </div>

      {/* Chart */}
      <div className="w-full h-[180px] overview-chart-container rounded overflow-hidden border border-slate-200 dark:border-slate-800">
        <Sparkline
          data={chartData}
          color={trend ? "#10B981" : "#EF4444"}
        />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="stat-card rounded p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
          >
            <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-500 font-sans-tabular mb-1">
              {card.label}
            </p>
            <p className="font-serif-display text-[22px] text-slate-900 dark:text-slate-100 leading-tight">
              {card.value}
            </p>
            {card.sub && (
              <span
                className={`text-[11px] font-mono font-medium ${
                  card.subGreen ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                {card.sub}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
