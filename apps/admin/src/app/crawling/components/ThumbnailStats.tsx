'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import ChartCard from '@/app/stats/components/ChartCard';
import DateRangeFilter from '@/app/stats/components/DateRangeFilter';
import { useThumbnailStats } from '@/hooks/graphql/stats';
import { DateInterval } from '@/types/stats';

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

const TYPE_LABEL: Record<string, string> = {
  post: '게시글 이미지 (post)',
  mall: '쇼핑몰 이미지 (mall)',
  missing: '미수집',
};

const ThumbnailStats = () => {
  const defaultRange = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [interval, setInterval] = useState<DateInterval>(DateInterval.DAILY);

  const [fetchStats, { data, loading }] = useThumbnailStats();

  const runQuery = () => {
    fetchStats({ variables: { startDate, endDate, interval } });
  };

  useEffect(() => {
    runQuery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = data?.thumbnailStats;
  const typeDistribution = stats?.typeDistribution ?? [];
  const mallDistribution = stats?.mallDistribution ?? [];
  const total = stats?.totalCount ?? 0;
  const missing = stats?.missingCount ?? 0;
  const collectionRate = total > 0 ? ((total - missing) / total) * 100 : 0;

  const typeLabels = typeDistribution.map(
    (t) => TYPE_LABEL[t.thumbnailType ?? 'missing'] ?? t.thumbnailType ?? '미수집',
  );
  const typeCounts = typeDistribution.map((t) => t.count);

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="text-sm text-bodydark2">기간 내 상품</div>
          <div className="font-mono mt-1 text-2xl font-semibold text-black dark:text-white">
            {total.toLocaleString()}
          </div>
        </div>
        <div className="rounded-lg border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="text-sm text-bodydark2">썸네일 수집률</div>
          <div className="font-mono mt-1 text-2xl font-semibold text-black dark:text-white">
            {collectionRate.toFixed(1)}%
          </div>
        </div>
        <div className="rounded-lg border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="text-sm text-bodydark2">미수집</div>
          <div className="font-mono mt-1 text-2xl font-semibold text-danger">
            {missing.toLocaleString()}
          </div>
        </div>
      </div>

      <ChartCard title="썸네일 타입 분포" loading={loading}>
        {typeDistribution.length > 0 ? (
          <Chart
            type="donut"
            height={320}
            options={{
              labels: typeLabels,
              legend: { position: 'right' },
              dataLabels: {
                formatter: (val: number) => `${val.toFixed(1)}%`,
              },
            }}
            series={typeCounts}
          />
        ) : (
          <p className="py-8 text-center text-bodydark2">조회 결과가 없습니다.</p>
        )}
      </ChartCard>

      <ChartCard title="쇼핑몰별 썸네일 수집량 (상위 20개)" loading={loading}>
        {mallDistribution.length > 0 ? (
          <Chart
            type="bar"
            height={Math.max(320, mallDistribution.length * 28)}
            options={{
              chart: { toolbar: { show: true } },
              plotOptions: {
                bar: { horizontal: true, borderRadius: 4, distributed: true },
              },
              dataLabels: { enabled: true },
              xaxis: {
                categories: mallDistribution.map((m) => m.mallName),
                title: { text: '수집 수' },
              },
              legend: { show: false },
            }}
            series={[
              {
                name: '수집 수',
                data: mallDistribution.map((m) => m.count),
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

export default ThumbnailStats;
