'use client';

import dynamic from 'next/dynamic';

import { compact } from '@/lib/format';

import type { ApexAxisChartSeries, ApexNonAxisChartSeries, ApexOptions } from 'apexcharts';

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

type Series = ApexAxisChartSeries | ApexNonAxisChartSeries;

interface Props {
  type: 'bar' | 'line' | 'area' | 'donut' | 'pie';
  series: Series;
  /** x 축 이름(날짜 등). 원형 차트면 조각 이름 */
  categories?: string[];
  height?: number;
  colors?: string[];
  stacked?: boolean;
  horizontal?: boolean;
  /** 툴팁에 보일 값 표기 (기본: 천 단위 쉼표) */
  format?: (v: number) => string;
  /** 위 기본값으로 안 되는 것만 덮어쓴다 */
  options?: ApexOptions;
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const merge = <T,>(base: T, over?: unknown): T => {
  if (!isPlainObject(over) || !isPlainObject(base)) return (over ?? base) as T;
  const out: Record<string, unknown> = { ...base };
  Object.entries(over).forEach(([k, v]) => (out[k] = merge(out[k], v)));
  return out as T;
};

const hasData = (series: Series) =>
  series.some((s) =>
    typeof s === 'number'
      ? s !== 0
      : (s.data as unknown[]).some((d) => (isPlainObject(d) ? d.y : d) != null),
  );

/**
 * 어드민 차트 — 폰에서 읽히는 기본값을 한 곳에.
 * 툴바·줌 없음, x 눈금 6개 안팎·안 기울임, y 는 '1.2만' 같은 짧은 값, 범례는 계열이 둘 이상일 때만 아래에.
 */
const Chart = ({
  type,
  series,
  categories,
  height = 220,
  colors,
  stacked,
  horizontal,
  format = (v) => Math.round(v).toLocaleString(),
  options,
}: Props) => {
  if (!hasData(series)) {
    return (
      <div className="flex items-center justify-center text-sm text-bodydark2" style={{ height }}>
        데이터가 없습니다
      </div>
    );
  }

  const round = type === 'donut' || type === 'pie';
  const many = (categories?.length ?? 0) > 8;
  const base: ApexOptions = round
    ? {
        labels: categories,
        colors,
        legend: { position: 'bottom', fontSize: '12px' },
        dataLabels: { enabled: true, formatter: (v: number) => `${Math.round(v)}%` },
        tooltip: { y: { formatter: format } },
      }
    : {
        chart: { toolbar: { show: false }, zoom: { enabled: false }, stacked },
        colors,
        plotOptions: { bar: { horizontal, columnWidth: '60%', borderRadius: 2, barHeight: '70%' } },
        stroke: type === 'bar' ? { width: 0 } : { width: 2, curve: 'smooth' },
        xaxis: {
          categories,
          tickAmount: many && !horizontal ? 6 : undefined,
          tickPlacement: 'on',
          axisTicks: { show: false },
          labels: {
            rotate: 0,
            hideOverlappingLabels: true,
            style: { fontSize: '10px' },
            formatter: horizontal ? (v: string) => compact(Number(v)) : undefined,
          },
        },
        yaxis: {
          tickAmount: horizontal ? undefined : 3,
          labels: {
            maxWidth: horizontal ? 110 : 60,
            style: { fontSize: '10px' },
            formatter: horizontal ? undefined : (v: number) => compact(v),
          },
        },
        grid: { strokeDashArray: 4, padding: { left: 4, right: 8 } },
        legend: {
          show: series.length > 1,
          position: 'bottom',
          fontSize: '11px',
          itemMargin: { horizontal: 6, vertical: 2 },
        },
        dataLabels: { enabled: false },
        tooltip: {
          shared: !horizontal && series.length > 1,
          intersect: false,
          y: { formatter: format },
        },
      };

  return <ApexChart type={type} height={height} series={series} options={merge(base, options)} />;
};

export default Chart;
