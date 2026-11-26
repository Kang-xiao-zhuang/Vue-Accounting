"use client";

import type { LedgerRecord } from "@/types";
import { CategoryChart } from "@/components/common/category-chart";
import { MonthCompare } from "@/components/common/month-compare";
import { TrendChart } from "@/components/common/trend-chart";

interface StatsPanelProps {
  /** 当前周期内的记录，用于分类占比。 */
  periodRecords: LedgerRecord[];
  /** 全量记录，用于月对比与趋势。 */
  allRecords: LedgerRecord[];
}

/**
 * 统计面板单独成块，由 ledger-page 动态加载：
 * recharts 体积大，只有切到「统计」标签时才拉取对应 chunk，记录列表首屏不受影响。
 */
export function StatsPanel({ periodRecords, allRecords }: StatsPanelProps) {
  return (
    <>
      <CategoryChart records={periodRecords} />
      <MonthCompare records={allRecords} />
      <TrendChart records={allRecords} />
    </>
  );
}
