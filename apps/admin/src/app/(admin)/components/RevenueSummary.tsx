'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import Chart from '@/components/Chart';
import Panel from '@/components/Panel';
import SegmentedControl from '@/components/SegmentedControl';
import { useMyAdminAccess } from '@/hooks/graphql/permission';
import { useRevenueTrend } from '@/hooks/graphql/profitLink';
import { canAccessPath } from '@/lib/adminSection';
import { monthDay as md, shortWon, won } from '@/lib/format';
import { sourceColor, sourceName } from '@/lib/labels';
import { kstDaysAgo, toKstDateString, toStatsDateRange } from '@/utils/date';

const DAY_MS = 24 * 60 * 60 * 1000;
/** [from, to] KST 날짜를 하루씩 — 수익 0인 날도 막대 자리를 남긴다 */
const daysBetween = (from: string, to: string) => {
  const days: string[] = [];
  for (let t = Date.parse(`${from}T00:00:00Z`); t <= Date.parse(`${to}T00:00:00Z`); t += DAY_MS) {
    days.push(new Date(t).toISOString().slice(0, 10));
  }
  return days;
};

// 어제·오늘은 아직 덜 찬 값 — 쿠팡·네이버는 하루 뒤 오후, 애드센스는 이틀 뒤에 들어온다
const PARTIAL_COLOR = '#C7CEF7';

const PERIODS = [
  { value: 'month', label: '이번 달' },
  { value: 'last30', label: '최근 30일' },
] as const;
type Period = (typeof PERIODS)[number]['value'];

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
      .map(([code, revenue]) => ({
        code,
        revenue,
        name: sourceName(code),
        color: sourceColor(code),
      }));
    const days = daysBetween(periodStart, today);
    return {
      total: sources.reduce((acc, s) => acc + s.revenue, 0),
      top: Math.max(0, ...sources.map((s) => s.revenue)),
      sources,
      days,
      daily: days.map((d) => ({
        x: md(d),
        y: Math.round(byDay.get(d) ?? 0),
        fillColor: d >= yesterday ? PARTIAL_COLOR : '#3C50E0',
      })),
      partialFrom: days.findIndex((d) => d >= yesterday),
    };
  }, [rows, periodStart, today, yesterday]);

  if (!canProfit) return null;

  const sum = (from: string, to = today) =>
    rows
      ?.filter((r) => r.date.slice(0, 10) >= from && r.date.slice(0, 10) <= to)
      .reduce((acc, r) => acc + r.revenue, 0);
  const todayBySource = rows
    ?.filter((r) => r.date.slice(0, 10) === today && r.revenue !== 0)
    .sort((a, b) => b.revenue - a.revenue);
  const stats = [
    { label: '오늘', value: sum(today), partial: true },
    { label: '어제', value: sum(yesterday, yesterday), partial: true },
    { label: '최근 7일', value: sum(weekStart), partial: false },
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
              <p className="text-xs text-body">
                {s.label}
                {s.partial && <span className="ml-1 text-[10px] text-bodydark2">집계 중</span>}
              </p>
              <p className="mt-1 text-base font-bold text-black sm:text-xl">
                {s.value === undefined ? '…' : shortWon(s.value)}
              </p>
            </div>
          ))}
        </div>
        {todayBySource && todayBySource.length > 0 && (
          <p className="mt-3 border-t border-stroke pt-2 text-xs text-body">
            <span className="font-medium text-black">오늘</span>{' '}
            {todayBySource.map((r) => `${sourceName(r.source)} ${shortWon(r.revenue)}`).join(' · ')}
          </p>
        )}
      </Panel>

      <Panel className="p-4 sm:p-6">
        <SegmentedControl options={PERIODS} value={period} onChange={setPeriod} />

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
                  series={[{ name: '수익', data: view.daily }]}
                  format={(v) => won(v)}
                  options={{
                    xaxis: { type: 'category' },
                    tooltip: {
                      y: {
                        formatter: (v: number, opts?: { dataPointIndex: number }) =>
                          view.partialFrom >= 0 && (opts?.dataPointIndex ?? -1) >= view.partialFrom
                            ? `${won(v)} (집계 중)`
                            : won(v),
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <p className="mt-3 text-[11px] leading-relaxed text-bodydark2">
          <span
            className="mr-1 inline-block h-2 w-2 rounded-xs align-middle"
            style={{ background: PARTIAL_COLOR }}
          />
          연한 막대(어제·오늘)는 집계 중 — 쿠팡·네이버는 하루 뒤 오후, 애드센스는 이틀 뒤에 들어와
          더 오른다. 결제일 기준·취소 제외.
        </p>
      </Panel>
    </section>
  );
};

export default RevenueSummary;
