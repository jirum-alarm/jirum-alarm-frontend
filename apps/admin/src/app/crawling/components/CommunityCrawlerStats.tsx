'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import ChartCard from '@/app/stats/components/ChartCard';
import DateRangeFilter from '@/app/stats/components/DateRangeFilter';
import { useProductRegistrationStatsByProvider } from '@/hooks/graphql/stats';
import { DateInterval, ProviderType } from '@/types/stats';
import { formatStatsDate } from '@/utils/date';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const getDefaultDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
};

interface ProviderSeries {
  name: string;
  data: { x: string; y: number }[];
}

const CommunityCrawlerStats = () => {
  const defaultRange = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [interval, setInterval] = useState<DateInterval>(DateInterval.DAILY);

  const [fetchStats, { data, loading }] = useProductRegistrationStatsByProvider();

  const runQuery = () => {
    fetchStats({
      variables: {
        startDate,
        endDate,
        interval,
        providerType: ProviderType.COMMUNITY,
      },
    });
  };

  // 페이지 진입 시 자동 조회
  useEffect(() => {
    runQuery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = data?.productRegistrationStatsByProvider ?? [];

  // provider별로 시계열을 묶음
  const byProvider = new Map<number, ProviderSeries>();
  const allDates = new Set<string>();
  for (const row of rows) {
    allDates.add(row.date);
    const existing = byProvider.get(row.providerId);
    if (existing) {
      existing.data.push({ x: row.date, y: row.count });
    } else {
      byProvider.set(row.providerId, {
        name: row.providerName,
        data: [{ x: row.date, y: row.count }],
      });
    }
  }

  // 모든 시리즈에 동일한 x축을 채워서(없는 날짜는 0) 비교 가능하게
  const sortedDates = Array.from(allDates).sort();
  const series = Array.from(byProvider.values())
    .map((s) => {
      const dataByX = new Map(s.data.map((d) => [d.x, d.y]));
      return {
        name: s.name,
        data: sortedDates.map((date) => ({
          x: date,
          y: dataByX.get(date) ?? 0,
        })),
      };
    })
    // 누적 수 많은 순으로 정렬해서 legend 가독성 ↑
    .sort((a, b) => {
      const aSum = a.data.reduce((acc, d) => acc + d.y, 0);
      const bSum = b.data.reduce((acc, d) => acc + d.y, 0);
      return bSum - aSum;
    });

  return (
    <div className="flex flex-col gap-6">
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        interval={interval}
        onChangeStartDate={setStartDate}
        onChangeEndDate={setEndDate}
        onChangeInterval={setInterval}
        onSearch={runQuery}
      />

      <ChartCard title="Provider별 신규 상품 수집 시계열" loading={loading}>
        {series.length > 0 ? (
          <Chart
            type="line"
            height={420}
            options={{
              chart: { toolbar: { show: true } },
              xaxis: {
                type: 'category',
                categories: sortedDates.map((d) => formatStatsDate(d)),
                labels: { rotate: -45 },
              },
              yaxis: { title: { text: '수집 수' } },
              stroke: { curve: 'smooth', width: 2 },
              legend: { position: 'right' },
              tooltip: { shared: true },
            }}
            series={series.map((s) => ({ name: s.name, data: s.data.map((d) => d.y) }))}
          />
        ) : (
          <p className="py-8 text-center text-bodydark2">조회 결과가 없습니다.</p>
        )}
      </ChartCard>

      <ChartCard title="기간 내 Provider별 누적 수집량" loading={loading}>
        {series.length > 0 ? (
          <Chart
            type="bar"
            height={400}
            options={{
              chart: { toolbar: { show: true } },
              plotOptions: {
                bar: { horizontal: true, borderRadius: 4, distributed: true },
              },
              dataLabels: { enabled: true },
              xaxis: {
                categories: series.map((s) => s.name),
                title: { text: '수집 수' },
              },
              legend: { show: false },
            }}
            series={[
              {
                name: '수집 수',
                data: series.map((s) => s.data.reduce((acc, d) => acc + d.y, 0)),
              },
            ]}
          />
        ) : (
          <p className="py-8 text-center text-bodydark2">조회 결과가 없습니다.</p>
        )}
      </ChartCard>
    </div>
  );
};

export default CommunityCrawlerStats;
