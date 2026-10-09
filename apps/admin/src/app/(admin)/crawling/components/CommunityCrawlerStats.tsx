'use client';

import { useEffect, useMemo, useState } from 'react';

import ChartCard from '@/app/(admin)/stats/components/ChartCard';
import DateRangeFilter, { useStatsRange } from '@/app/(admin)/stats/components/DateRangeFilter';
import { axisDate } from '@/app/(admin)/stats/components/TrendCard';
import Chart from '@/components/Chart';
import RankList from '@/components/RankList';
import { useProductRegistrationStatsByProvider } from '@/hooks/graphql/stats';
import { ProviderType } from '@/types/stats';
import { toStatsDateRange } from '@/utils/date';

const ALL = 'all';

const CommunityCrawlerStats = () => {
  const [range, setRange] = useStatsRange(7);
  const [picked, setPicked] = useState(ALL);
  const [fetchStats, { data, loading }] = useProductRegistrationStatsByProvider();

  useEffect(() => {
    fetchStats({
      variables: {
        ...toStatsDateRange(range.startDate, range.endDate),
        interval: range.interval,
        providerType: ProviderType.COMMUNITY,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.startDate, range.endDate, range.interval]);

  const { dates, providers, totals } = useMemo(() => {
    const rows = data?.productRegistrationStatsByProvider ?? [];
    const dateList = [...new Set(rows.map((r) => r.date))].sort();
    const byProvider = new Map<string, Map<string, number>>();
    rows.forEach((r) => {
      const m = byProvider.get(r.providerName) ?? new Map<string, number>();
      m.set(r.date, (m.get(r.date) ?? 0) + r.count);
      byProvider.set(r.providerName, m);
    });
    const sum = (m: Map<string, number>) => [...m.values()].reduce((a, b) => a + b, 0);
    return {
      dates: dateList,
      providers: byProvider,
      totals: [...byProvider.entries()]
        .map(([label, m]) => ({ label, value: sum(m) }))
        .sort((a, b) => b.value - a.value),
    };
  }, [data]);

  // 커뮤니티 15개를 선 15개로 그리면 폰에선 못 읽는다 — 합계 하나, 또는 고른 커뮤니티 하나만
  const line = dates.map((d) =>
    picked === ALL
      ? [...providers.values()].reduce((acc, m) => acc + (m.get(d) ?? 0), 0)
      : (providers.get(picked)?.get(d) ?? 0),
  );

  return (
    <div className="flex flex-col gap-6">
      <DateRangeFilter value={range} onChange={setRange} />

      <ChartCard title="신규 상품 수집" loading={loading}>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <p className="text-2xl font-bold text-black dark:text-white">
            {line.reduce((a, b) => a + b, 0).toLocaleString()}
            <span className="ml-1 text-sm font-normal text-body">합계</span>
          </p>
          <select
            value={picked}
            onChange={(e) => setPicked(e.target.value)}
            className="rounded border border-stroke px-2 py-1.5 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
          >
            <option value={ALL}>전체 커뮤니티</option>
            {totals.map((t) => (
              <option key={t.label} value={t.label}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <Chart
          type="area"
          categories={dates.map(axisDate)}
          colors={['#3C50E0']}
          series={[{ name: picked === ALL ? '전체' : picked, data: line }]}
          options={{ fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.05 } } }}
        />
      </ChartCard>

      <ChartCard title="커뮤니티별 수집량" loading={loading}>
        <RankList items={totals} initial={20} />
      </ChartCard>
    </div>
  );
};

export default CommunityCrawlerStats;
