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

// 출처 코드 → 화면 이름·색 (목록 점·막대가 같은 색)
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
/** 좁은 칸용 — 1만 이상은 '12.3만원' */
const shortWon = (v: number) =>
  Math.abs(v) >= 10000 ? `${Number((v / 10000).toFixed(1)).toLocaleString()}만원` : won(v);
const md = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;

const DAY_MS = 24 * 60 * 60 * 1000;
/** [from, to] KST 날짜를 하루씩 — 수익 0인 날도 막대 자리를 남긴다 */
const daysBetween = (from: string, to: string) => {
  const days: string[] = [];
  for (let t = Date.parse(`${from}T00:00:00Z`); t <= Date.parse(`${to}T00:00:00Z`); t += DAY_MS) {
    days.push(new Date(t).toISOString().slice(0, 10));
  }
  return days;
};

const PERIODS = [
  { key: 'month', label: '이번 달' },
  { key: 'last30', label: '최근 30일' },
] as const;
type Period = (typeof PERIODS)[number]['key'];

/**
 * 홈 맨 위 '수익'(세후, 제휴 + 애드센스). 모바일 한 화면에 읽히게:
 * 오늘·어제·7일 숫자 → 기간(이번 달 / 최근 30일) 합계 → 출처별 순위 막대 → 일별 합계 막대.
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
    const bySource = new Map<string, number>();
    const byDay = new Map<string, number>();
    rows.forEach((r) => {
      const day = r.date.slice(0, 10);
      if (day < periodStart) return;
      bySource.set(r.source, (bySource.get(r.source) ?? 0) + r.revenue);
      byDay.set(day, (byDay.get(day) ?? 0) + r.revenue);
    });
    const sources = [...bySource.entries()]
      .filter(([, v]) => v !== 0)
      .sort((a, b) => b[1] - a[1])
      .map(([code, revenue]) => ({ code, revenue, ...sourceOf(code) }));
    const days = daysBetween(periodStart, today);
    return {
      total: sources.reduce((acc, s) => acc + s.revenue, 0),
      top: Math.max(0, ...sources.map((s) => s.revenue)),
      sources,
      days,
      daily: days.map((d) => Math.round(byDay.get(d) ?? 0)),
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
  const stats = [
    { label: '오늘', value: sum(today) },
    { label: '어제', value: sum(yesterday, yesterday) },
    { label: '최근 7일', value: sum(weekStart) },
  ];

  return (
    <section className="mb-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-black">수익 (세후)</h3>
        <Link href="/profit-link" className="text-xs font-medium text-primary">
          수익링크 상세 ›
        </Link>
      </div>

      <Panel className="p-4">
        <div className="grid grid-cols-3 divide-x divide-stroke text-center">
          {stats.map((s) => (
            <div key={s.label} className="px-1">
              <p className="text-xs text-body">{s.label}</p>
              <p className="mt-1 text-base font-bold text-black sm:text-xl">
                {s.value === undefined ? '…' : shortWon(s.value)}
              </p>
            </div>
          ))}
        </div>
        {todayBySource && todayBySource.length > 0 && (
          <p className="mt-3 border-t border-stroke pt-2 text-xs text-body">
            <span className="font-medium text-black">오늘</span>{' '}
            {todayBySource
              .map((r) => `${sourceOf(r.source).name} ${shortWon(r.revenue)}`)
              .join(' · ')}
          </p>
        )}
      </Panel>

      <Panel className="p-4 sm:p-6">
        <div className="grid grid-cols-2 rounded-lg bg-gray-2 p-1 text-sm sm:inline-grid">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriod(p.key)}
              className={`rounded-md px-4 py-1.5 font-medium ${
                period === p.key ? 'bg-white text-black shadow-sm' : 'text-body'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs text-body">
          {md(periodStart)} ~ {md(today)} 합계
        </p>
        <p className="text-3xl font-bold text-black">{view ? won(view.total) : '…'}</p>

        {view && view.total > 0 && (
          // 넓은 화면은 출처 목록 | 일별 그래프 좌우로 (모바일은 위아래)
          <div className="lg:grid lg:grid-cols-2 lg:gap-10">
            <ul className="mt-4 space-y-2.5">
              {view.sources.map((s) => (
                <li key={s.code} className="text-sm">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-black">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: s.color }}
                      />
                      {s.name}
                    </span>
                    <span className="font-semibold text-black">
                      {won(s.revenue)}
                      <span className="ml-1.5 inline-block w-8 text-right text-xs font-normal text-bodydark2">
                        {Math.round((s.revenue / view.total) * 100)}%
                      </span>
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-gray-2">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(0, (s.revenue / view.top) * 100)}%`,
                        background: s.color,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 lg:mt-4">
              <p className="text-xs font-medium text-body">일별 수익</p>
              <div className="-mx-2">
                <Chart
                  type="bar"
                  height={180}
                  options={{
                    chart: { toolbar: { show: false }, zoom: { enabled: false } },
                    colors: ['#3C50E0'],
                    plotOptions: { bar: { columnWidth: '60%', borderRadius: 2 } },
                    xaxis: {
                      categories: view.days.map(md),
                      tickAmount: 6,
                      tickPlacement: 'on',
                      labels: { rotate: 0, style: { fontSize: '10px' } },
                      axisTicks: { show: false },
                    },
                    yaxis: {
                      tickAmount: 3,
                      labels: {
                        style: { fontSize: '10px' },
                        formatter: (v: number) => shortWon(v).replace('원', ''),
                      },
                    },
                    grid: { strokeDashArray: 4, padding: { left: 0, right: 4 } },
                    tooltip: { y: { formatter: (v: number) => won(v) } },
                    dataLabels: { enabled: false },
                    legend: { show: false },
                  }}
                  series={[{ name: '수익', data: view.daily }]}
                />
              </div>
            </div>
          </div>
        )}

        <p className="mt-3 text-[11px] leading-relaxed text-bodydark2">
          결제일 기준·취소 제외. 최근 1~2일은 덜 찬 값(쿠팡·네이버·애드센스가 하루 이틀 늦게
          들어온다)
        </p>
      </Panel>
    </section>
  );
};

export default RevenueSummary;
