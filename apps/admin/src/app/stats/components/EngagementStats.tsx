'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

import { useDailyServiceViewStats, useTopNotificationKeywords } from '@/hooks/graphql/stats';
import { DateInterval } from '@/types/stats';
import { formatStatsDate } from '@/utils/date';

import ChartCard from './ChartCard';
import DateRangeFilter from './DateRangeFilter';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const getDefaultDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
};

const EngagementStats = () => {
  const defaultRange = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [interval, setInterval] = useState<DateInterval>(DateInterval.DAILY);

  const [fetchViewStats, { data: viewData, loading: viewLoading }] = useDailyServiceViewStats();
  const { data: keywordData, loading: keywordLoading } = useTopNotificationKeywords({ limit: 30 });

  const handleSearch = () => {
    fetchViewStats({
      variables: { startDate, endDate, interval },
    });
  };

  const viewStats = viewData?.dailyServiceViewStats ?? [];
  const keywords = keywordData?.topNotificationKeywords ?? [];

  return (
    <div className="flex flex-col gap-6">
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        interval={interval}
        onChangeStartDate={setStartDate}
        onChangeEndDate={setEndDate}
        onChangeInterval={setInterval}
        onSearch={handleSearch}
      />

      <ChartCard title="서비스 조회수 추이" loading={viewLoading}>
        {viewStats.length > 0 ? (
          <Chart
            type="area"
            height={350}
            options={{
              chart: { toolbar: { show: true } },
              xaxis: {
                categories: viewStats.map((d) => formatStatsDate(d.date)),
                labels: { rotate: -45 },
              },
              yaxis: { title: { text: '조회수' } },
              stroke: { curve: 'smooth', width: 2 },
              fill: {
                type: 'gradient',
                gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 },
              },
              colors: ['#3C50E0'],
            }}
            series={[
              {
                name: '조회수',
                data: viewStats.map((d) => d.count),
              },
            ]}
          />
        ) : (
          <p className="py-8 text-center text-bodydark2">조회 버튼을 눌러 데이터를 불러오세요.</p>
        )}
      </ChartCard>

      <ChartCard title="알림 키워드 TOP 30" loading={keywordLoading}>
        {keywords.length > 0 ? (
          <Chart
            type="bar"
            height={500}
            options={{
              chart: { toolbar: { show: false } },
              plotOptions: {
                bar: { horizontal: true, borderRadius: 4, barHeight: '70%' },
              },
              xaxis: { title: { text: '등록 수' } },
              yaxis: {
                labels: { maxWidth: 150 },
              },
              colors: ['#80CAEE'],
              dataLabels: { enabled: true },
            }}
            series={[
              {
                name: '등록 수',
                data: keywords.map((k) => ({
                  x: k.keyword,
                  y: k.count,
                })),
              },
            ]}
          />
        ) : (
          <p className="py-8 text-center text-bodydark2">데이터가 없습니다.</p>
        )}
      </ChartCard>
    </div>
  );
};

export default EngagementStats;
