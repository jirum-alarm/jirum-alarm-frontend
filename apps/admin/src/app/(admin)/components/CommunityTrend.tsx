'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';

import Panel from '@/components/Panel';
import { ignoreLazyRejection } from '@/hooks/graphql/options';
import { useMyAdminAccess } from '@/hooks/graphql/permission';
import { useProductRegistrationStatsByProvider } from '@/hooks/graphql/stats';
import { canAccessPath } from '@/lib/adminSection';
import { CHART_COLOR } from '@/lib/chartColors';
import { monthDay as md } from '@/lib/format';
import { DateInterval, ProviderType } from '@/types/stats';
import { formatStatsDate, toKstDateString, toStatsDateRange } from '@/utils/date';

const SPARK_COLOR = CHART_COLOR.primary;
/** 지난 7일이 그 전 7일의 절반 아래면 «수집이 줄었다» — 셀렉터 고장은 대개 이렇게 먼저 보인다 */
const DROP_RATIO = 0.5;

/** 어제까지 14일 — 오늘은 덜 찬 날이라 추이·주간 비교에서 빼고 숫자로만 보인다 */
const DAY_MS = 24 * 60 * 60 * 1000;
const fullDaysBefore = (today: string) =>
  Array.from({ length: 14 }, (_, i) =>
    new Date(Date.parse(`${today}T00:00:00Z`) - (14 - i) * DAY_MS).toISOString().slice(0, 10),
  );

type Row = { name: string; daily: number[]; today: number; last7: number; prev7: number };

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** 14일 수집량 작은 선 — 점마다 투명 칸을 깔아 손가락·마우스로 그날 숫자를 본다 */
const Sparkline = ({ name, days, values }: { name: string; days: string[]; values: number[] }) => {
  const max = Math.max(1, ...values);
  const w = 100;
  const h = 28;
  const step = w / (values.length - 1);
  const y = (v: number) => h - 2 - (v / max) * (h - 4);
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="h-7 w-full"
      role="img"
      aria-label={`${name} 최근 14일 수집 추이`}
    >
      <polyline
        points={values.map((v, i) => `${i * step},${y(v)}`).join(' ')}
        fill="none"
        stroke={SPARK_COLOR}
        strokeWidth={2}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {values.map((v, i) => (
        <rect key={days[i]} x={(i - 0.5) * step} y={0} width={step} height={h} fill="transparent">
          <title>{`${md(days[i])} ${v.toLocaleString()}건`}</title>
        </rect>
      ))}
    </svg>
  );
};

const Change = ({ last7, prev7 }: { last7: number; prev7: number }) => {
  if (prev7 === 0) {
    return <span className="text-bodydark2">{last7 > 0 ? '새로' : '-'}</span>;
  }
  const pct = Math.round(((last7 - prev7) / prev7) * 100);
  if (last7 < prev7 * DROP_RATIO) {
    return <span className="font-medium text-danger">▼{Math.abs(pct)}%</span>;
  }
  return (
    <span className="text-bodydark2">
      {pct > 0 ? '▲' : pct < 0 ? '▼' : ''}
      {Math.abs(pct)}%
    </span>
  );
};

/**
 * 홈 '커뮤니티 수집' — 커뮤니티마다 14일 추이 한 줄. 15개 선을 한 차트에 겹치면 못 읽어서 작은 선을 줄마다 둔다.
 * 지난 7일 vs 그 전 7일이 절반 아래로 떨어진 곳은 빨갛게. 자세한 기간·커뮤니티 고르기는 /crawling.
 */
const CommunityTrend = () => {
  const { data: accessData } = useMyAdminAccess();
  const canCrawling = canAccessPath(accessData?.myAdminAccess, '/crawling');
  const [fetchStats, { data }] = useProductRegistrationStatsByProvider();

  const today = toKstDateString();
  const days = useMemo(() => fullDaysBefore(today), [today]);

  useEffect(() => {
    if (!canCrawling) return;
    fetchStats({
      variables: {
        ...toStatsDateRange(days[0], today),
        interval: DateInterval.DAILY,
        providerType: ProviderType.COMMUNITY,
      },
    }).catch(ignoreLazyRejection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canCrawling]);

  const rows = useMemo(() => {
    const raw = data?.productRegistrationStatsByProvider;
    if (!raw) return undefined;
    // 서버 날짜는 타임스탬프·문자열이 섞여 와서 같은 표기로 맞춰 비교한다
    const keyOf = (d: string) => formatStatsDate(d);
    const dayIndex = new Map(days.map((d, i) => [keyOf(d), i]));
    const todayKey = keyOf(today);
    const byName = new Map<string, Row>();
    raw.forEach((r) => {
      const row = byName.get(r.providerName) ?? {
        name: r.providerName,
        daily: days.map(() => 0),
        today: 0,
        last7: 0,
        prev7: 0,
      };
      const key = keyOf(r.date);
      if (key === todayKey) row.today += r.count;
      const i = dayIndex.get(key);
      if (i !== undefined) row.daily[i] += r.count;
      byName.set(r.providerName, row);
    });
    const list = [...byName.values()].map((row) => ({
      ...row,
      last7: sum(row.daily.slice(7)),
      prev7: sum(row.daily.slice(0, 7)),
    }));
    list.sort((a, b) => b.last7 - a.last7 || b.today - a.today);
    const total: Row = {
      name: '전체',
      daily: days.map((_, i) => sum(list.map((r) => r.daily[i]))),
      today: sum(list.map((r) => r.today)),
      last7: sum(list.map((r) => r.last7)),
      prev7: sum(list.map((r) => r.prev7)),
    };
    return [total, ...list];
  }, [data, days, today]);

  if (!canCrawling) return null;

  return (
    <section className="mb-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-black">커뮤니티 수집</h3>
        <Link href="/crawling" className="text-xs font-medium text-primary">
          크롤링 상세 ›
        </Link>
      </div>

      <Panel className="p-4 sm:p-6">
        {/* 이름 | 14일 추이 | 오늘 | 7일 합 · 지난주 대비. 넓은 화면에서 추이 칸을 끝까지 늘리면 선이 납작해져 폭을 막는다 */}
        <div className="grid grid-cols-[4.5rem_minmax(0,1fr)_3rem_5.5rem] items-center gap-x-3 border-b border-stroke pb-2 text-[11px] text-bodydark2 lg:grid-cols-[8rem_minmax(0,22rem)_4rem_7rem]">
          <span>커뮤니티</span>
          <span>
            {md(days[0])} ~ {md(days[days.length - 1])}
          </span>
          <span className="text-right">오늘</span>
          <span className="text-right">7일 · 전주비</span>
        </div>
        {rows === undefined ? (
          <p className="py-6 text-center text-sm text-bodydark2">…</p>
        ) : rows.length === 1 ? (
          <p className="py-6 text-center text-sm text-bodydark2">데이터가 없습니다</p>
        ) : (
          <ul>
            {rows.map((r, i) => (
              <li
                key={r.name}
                className={`grid grid-cols-[4.5rem_minmax(0,1fr)_3rem_5.5rem] items-center gap-x-3 py-1.5 text-sm lg:grid-cols-[8rem_minmax(0,22rem)_4rem_7rem] ${
                  i === 0 ? 'border-b border-stroke font-semibold' : ''
                }`}
              >
                <span className="truncate text-black">{r.name}</span>
                <Sparkline name={r.name} days={days} values={r.daily} />
                <span className="text-right text-black">{r.today.toLocaleString()}</span>
                <span className="text-right text-xs">
                  <span className="text-sm text-black">{r.last7.toLocaleString()}</span>{' '}
                  <Change last7={r.last7} prev7={r.prev7} />
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-[11px] leading-relaxed text-bodydark2">
          추이·7일은 어제까지 다 찬 날만. 빨간 ▼ = 지난 7일이 그 전 7일의 절반 아래 — 셀렉터
          고장이면 대개 여기서 먼저 보인다.
        </p>
      </Panel>
    </section>
  );
};

export default CommunityTrend;
