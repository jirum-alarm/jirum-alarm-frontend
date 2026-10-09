'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import Panel from '@/components/Panel';
import { useMyAdminAccess } from '@/hooks/graphql/permission';
import { useRevenueTrend } from '@/hooks/graphql/profitLink';
import { canAccessPath } from '@/lib/adminSection';
import { kstDaysAgo, toKstDateString, toStatsDateRange } from '@/utils/date';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// 출처 코드 → 화면 이름·색. 차트·비중 막대·목록이 같은 색을 쓰게 한 곳에 둔다
const SOURCES: Record<string, { name: string; color: string }> = {
  toss: { name: '토스', color: '#3182F6' },
  adpick: { name: '애드픽', color: '#10B981' },
  ali_express: { name: '알리', color: '#F97316' },
  naver: { name: '네이버', color: '#22C55E' },
  link_price: { name: '링크프라이스', color: '#8B5CF6' },
  coupang: { name: '쿠팡', color: '#EF4444' },
  adsense: { name: '애드센스', color: '#EAB308' },
};
const sourceOf = (code: string) => SOURCES[code] ?? { name: code, color: '#94A3B8' };

const won = (v: number) => `${Math.round(v).toLocaleString()}원`;
const DAY_MS = 24 * 60 * 60 * 1000;

/** [from, to] KST 날짜를 하루씩 — 수익 0인 날도 막대 자리를 남긴다 */
const daysBetween = (from: string, to: string) => {
  const days: string[] = [];
  for (let t = Date.parse(`${from}T00:00:00Z`); t <= Date.parse(`${to}T00:00:00Z`); t += DAY_MS) {
    days.push(new Date(t).toISOString().slice(0, 10));
  }
  return days;
};

type Period = 'month' | 'last30';

/**
 * 홈 맨 위 '수익'(세후, 제휴 + 애드센스). 오늘·어제·7일 타일 + 기간(이번 달 / 최근 30일) 합계·출처별 비중·일별 막대.
 * 수익링크 권한이 없으면 쿼리도 안 보낸다(보내면 FORBIDDEN 배너가 뜬다).
 */
const RevenueSummary = () => {
  const { data: accessData } = useMyAdminAccess();
  const canProfit = canAccessPath(accessData?.myAdminAccess, '/profit-link');
  const [period, setPeriod] = useState<Period>('month');

  const today = toKstDateString();
  const yesterday = kstDaysAgo(1);
  const weekStart = kstDaysAgo(6);
  const last30Start = kstDaysAgo(29);
  const monthStart = `${today.slice(0, 8)}01`;
  const range = useMemo(
    () => toStatsDateRange(last30Start < monthStart ? last30Start : monthStart, today),
    [last30Start, monthStart, today],
  );
  const { data } = useRevenueTrend(range, { skip: !canProfit });
  const rows = data?.revenueTrend;

  const periodStart = period === 'month' ? monthStart : last30Start;
  const view = useMemo(() => {
    if (!rows) return undefined;
    const inPeriod = rows.filter((r) => r.date.slice(0, 10) >= periodStart);
    const bySource = new Map<string, number>();
    inPeriod.forEach((r) => bySource.set(r.source, (bySource.get(r.source) ?? 0) + r.revenue));
    const sources = [...bySource.entries()]
      .filter(([, v]) => v !== 0)
      .sort((a, b) => b[1] - a[1])
      .map(([code, revenue]) => ({ code, revenue, ...sourceOf(code) }));
    const days = daysBetween(periodStart, today);
    const byKey = new Map(inPeriod.map((r) => [`${r.source}|${r.date.slice(0, 10)}`, r.revenue]));
    return {
      total: sources.reduce((acc, s) => acc + s.revenue, 0),
      sources,
      days,
      series: sources.map((s) => ({
        name: s.name,
        data: days.map((d) => byKey.get(`${s.code}|${d}`) ?? 0),
      })),
    };
  }, [rows, periodStart, today]);

  if (!canProfit) return null;

  const sum = (from: string, to = today) =>
    rows
      ?.filter((r) => r.date.slice(0, 10) >= from && r.date.slice(0, 10) <= to)
      .reduce((acc, r) => acc + r.revenue, 0);
  const todayBySource = rows
    ?.filter((r) => r.date.slice(0, 10) === today && r.revenue !== 0)
    .sort((a, b) => b.revenue - a.revenue);

  const tiles = [
    { label: '오늘', value: sum(today) },
    { label: '어제', value: sum(yesterday, yesterday) },
    { label: '최근 7일', value: sum(weekStart) },
  ];
  const md = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;

  return (
    <section className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-bodydark2">수익 (세후)</h3>
        <Link href="/profit-link" className="text-xs font-medium text-primary">
          수익링크 상세 ›
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {tiles.map((t) => (
          <Panel key={t.label} className="p-3 sm:p-4">
            <p className="text-xs font-medium text-body">{t.label}</p>
            <p className="mt-1 text-lg font-bold text-black sm:text-2xl">
              {t.value === undefined ? '…' : won(t.value)}
            </p>
            {t.label === '오늘' && todayBySource && todayBySource.length > 0 && (
              <ul className="mt-1 space-y-0.5 text-[11px] text-body">
                {todayBySource.map((r) => (
                  <li key={r.source}>
                    {sourceOf(r.source).name} {won(r.revenue)}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        ))}
      </div>

      <Panel className="mt-3 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-body">
              {period === 'month' ? '이번 달' : '최근 30일'} ({md(periodStart)} ~ {md(today)})
            </p>
            <p className="mt-1 text-2xl font-bold text-black sm:text-3xl">
              {view ? won(view.total) : '…'}
            </p>
          </div>
          <div className="inline-flex rounded-md border border-stroke p-0.5 text-sm">
            {(
              [
                ['month', '이번 달'],
                ['last30', '최근 30일'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setPeriod(key)}
                className={`rounded px-3 py-1 font-medium ${
                  period === key ? 'bg-primary text-white' : 'text-body'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {view && view.total > 0 && (
          <>
            {/* 출처별 비중 — 한 줄 막대 + 아래 목록(같은 색) */}
            <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-gray-2">
              {view.sources
                .filter((s) => s.revenue > 0)
                .map((s) => (
                  <div
                    key={s.code}
                    style={{ width: `${(s.revenue / view.total) * 100}%`, background: s.color }}
                    title={`${s.name} ${won(s.revenue)}`}
                  />
                ))}
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-3 lg:grid-cols-4">
              {view.sources.map((s) => (
                <li key={s.code} className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: s.color }}
                  />
                  <span className="text-body">{s.name}</span>
                  <span className="ml-auto font-semibold text-black">{won(s.revenue)}</span>
                  <span className="w-9 text-right text-xs text-bodydark2">
                    {Math.round((s.revenue / view.total) * 100)}%
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4">
              <Chart
                type="bar"
                height={260}
                options={{
                  chart: { stacked: true, toolbar: { show: false } },
                  colors: view.sources.map((s) => s.color),
                  xaxis: {
                    categories: view.days.map(md),
                    labels: { rotate: 0, hideOverlappingLabels: true },
                  },
                  yaxis: {
                    labels: {
                      formatter: (v: number) =>
                        v === 0
                          ? '0'
                          : `${(v / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })}만`,
                    },
                  },
                  tooltip: {
                    shared: true,
                    intersect: false,
                    y: { formatter: (v: number) => won(v) },
                  },
                  legend: { show: false },
                  dataLabels: { enabled: false },
                  plotOptions: { bar: { columnWidth: '70%', borderRadius: 2 } },
                  grid: { strokeDashArray: 4 },
                }}
                series={view.series}
              />
            </div>
          </>
        )}

        <p className="mt-2 text-[11px] text-bodydark2">
          결제일 기준·취소 제외. 최근 1~2일은 덜 찬 값(쿠팡·네이버·애드센스가 하루 이틀 늦게
          들어온다)
        </p>
      </Panel>
    </section>
  );
};

export default RevenueSummary;
