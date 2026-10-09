'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { useMyAdminAccess } from '@/hooks/graphql/permission';
import { useRevenueTrend } from '@/hooks/graphql/profitLink';
import { canAccessPath } from '@/lib/adminSection';
import { kstDaysAgo, toKstDateString, toStatsDateRange } from '@/utils/date';

/**
 * 홈 맨 위 '수익' — 수익링크 화면의 수익 추이(세후, 제휴 + 애드센스)를 합계만 뽑아 보여준다.
 * 수익링크 권한이 없으면 쿼리도 안 보낸다(보내면 FORBIDDEN 배너가 뜬다).
 */
const RevenueSummary = () => {
  const { data: accessData } = useMyAdminAccess();
  const canProfit = canAccessPath(accessData?.myAdminAccess, '/profit-link');

  const today = toKstDateString();
  const yesterday = kstDaysAgo(1);
  const weekStart = kstDaysAgo(6);
  const monthStart = `${today.slice(0, 8)}01`;
  const range = useMemo(
    () => toStatsDateRange(weekStart < monthStart ? weekStart : monthStart, today),
    [weekStart, monthStart, today],
  );
  const { data } = useRevenueTrend(range, { skip: !canProfit });

  if (!canProfit) return null;

  const rows = data?.revenueTrend;
  const sum = (from: string, to = today) =>
    rows
      ?.filter((r) => r.date.slice(0, 10) >= from && r.date.slice(0, 10) <= to)
      .reduce((acc, r) => acc + r.revenue, 0);

  // 오늘은 출처마다 들어오는 시점이 달라 합계만으론 어디가 비었는지 안 보인다
  const todayBySource = rows
    ?.filter((r) => r.date.slice(0, 10) === today && r.revenue !== 0)
    .sort((a, b) => b.revenue - a.revenue);

  const tiles = [
    { label: '오늘', value: sum(today) },
    { label: '어제', value: sum(yesterday, yesterday) },
    { label: '최근 7일', value: sum(weekStart) },
    { label: '이번 달', value: sum(monthStart) },
  ];

  return (
    <section className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-bodydark2">수익 (세후)</h3>
        <Link href="/profit-link" className="text-xs font-medium text-primary">
          수익 더 보기 ›
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="rounded-lg border border-stroke bg-white p-3 shadow-default sm:p-4"
          >
            <p className="text-xs font-medium text-body">{t.label}</p>
            <p className="mt-1 text-lg font-bold text-black sm:text-2xl">
              {t.value === undefined ? '…' : `${Math.round(t.value).toLocaleString()}원`}
            </p>
          </div>
        ))}
      </div>
      {todayBySource && todayBySource.length > 0 && (
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-body">
          <span className="font-medium">오늘 출처별</span>
          {todayBySource.map((r) => (
            <span key={r.source}>
              {r.source} {Math.round(r.revenue).toLocaleString()}원
            </span>
          ))}
        </p>
      )}
      <p className="mt-1 text-[11px] text-bodydark2">
        최근 1~2일은 덜 찬 값(쿠팡·네이버·애드센스가 늦게 들어온다)
      </p>
    </section>
  );
};

export default RevenueSummary;
