'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { ignoreLazyRejection } from '@/hooks/graphql/options';
import { useMyAdminAccess } from '@/hooks/graphql/permission';
import {
  useDailyServiceViewStats,
  useProductRegistrationStats,
  useUserRegistrationStats,
} from '@/hooks/graphql/stats';
import { canAccessPath } from '@/lib/adminSection';
import { DateCountOutput, DateInterval } from '@/types/stats';
import { formatStatsDate, kstDaysAgo, toKstDateString, toStatsDateRange } from '@/utils/date';

/**
 * 홈 '오늘' — 오늘·어제 숫자만. 추이 차트는 /stats 에 있다(예전 홈 차트 8개는 /stats 와 똑같은 복제였다).
 * 빈 날은 서버가 행을 안 줄 수 있어 순서가 아니라 날짜로 찾는다.
 */
const countOn = (rows: DateCountOutput[] | undefined, day: string) =>
  rows?.find((r) => formatStatsDate(r.date) === formatStatsDate(day))?.count ??
  (rows ? 0 : undefined);

const TodayStats = () => {
  const { data: accessData } = useMyAdminAccess();
  const canStats = canAccessPath(accessData?.myAdminAccess, '/stats');
  const [fetchUsers, users] = useUserRegistrationStats();
  const [fetchProducts, products] = useProductRegistrationStats();
  const [fetchViews, views] = useDailyServiceViewStats();

  const today = toKstDateString();
  const yesterday = kstDaysAgo(1);

  useEffect(() => {
    if (!canStats) return;
    const variables = { ...toStatsDateRange(yesterday, today), interval: DateInterval.DAILY };
    fetchUsers({ variables }).catch(ignoreLazyRejection);
    fetchProducts({ variables }).catch(ignoreLazyRejection);
    fetchViews({ variables }).catch(ignoreLazyRejection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canStats]);

  if (!canStats) return null;

  const tiles = [
    { label: '신규 가입', rows: users.data?.userRegistrationStats },
    { label: '수집된 딜', rows: products.data?.productRegistrationStats },
    { label: '서비스 조회수', rows: views.data?.dailyServiceViewStats },
  ];

  return (
    <section className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-bodydark2">오늘</h3>
        <Link href="/stats" className="text-xs font-medium text-primary">
          통계 더 보기 ›
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {tiles.map((t) => {
          const now = countOn(t.rows, today);
          const prev = countOn(t.rows, yesterday);
          return (
            <div
              key={t.label}
              className="rounded-lg border border-stroke bg-white p-3 shadow-default sm:p-4"
            >
              <p className="text-xs font-medium text-body">{t.label}</p>
              <p className="mt-1 text-xl font-bold text-black sm:text-2xl">
                {now === undefined ? '…' : now.toLocaleString()}
              </p>
              <p className="mt-0.5 text-[11px] text-bodydark2">
                어제 {prev === undefined ? '-' : prev.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TodayStats;
