'use client';

import Chart from '@/components/Chart';
import { formatStatsDate } from '@/utils/date';

import ChartCard from './ChartCard';

/** 서버 날짜(타임스탬프·문자열) → 축용 '10/3' */
export const axisDate = (date: string | number) =>
  formatStatsDate(date).slice(3).split('/').map(Number).join('/');

/** 기간 합계 + 추이 한 장 — 통계 화면의 '날짜별 건수' 차트 공통 */
const TrendCard = ({
  title,
  loading,
  rows,
  name,
  color = '#3C50E0',
}: {
  title: string;
  loading?: boolean;
  rows: { date: string | number; count: number }[];
  name: string;
  color?: string;
}) => (
  <ChartCard title={title} loading={loading}>
    <p className="text-2xl font-bold text-black dark:text-white">
      {rows.reduce((acc, r) => acc + r.count, 0).toLocaleString()}
      <span className="ml-1 text-sm font-normal text-body">합계</span>
    </p>
    <Chart
      type="area"
      categories={rows.map((r) => axisDate(r.date))}
      colors={[color]}
      series={[{ name, data: rows.map((r) => r.count) }]}
      options={{ fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.05 } } }}
    />
  </ChartCard>
);

export default TrendCard;
