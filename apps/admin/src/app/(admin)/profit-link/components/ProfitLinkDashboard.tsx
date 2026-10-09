'use client';

import { useMemo, useState } from 'react';

import ChartCard from '@/app/(admin)/stats/components/ChartCard';
import Chart from '@/components/Chart';
import SegmentedControl from '@/components/SegmentedControl';
import StatTiles from '@/components/StatTiles';
import StatusDot, { type StatusLevel } from '@/components/StatusDot';
import {
  useAffiliateSalesTrend,
  useProfitLinkErrorStats,
  useProfitLinkFunnelDaily,
  useProfitLinkMissedProducts,
  useProfitLinkProviderHealth,
  useProfitLinkQueueHealth,
  useRevenueTrend,
} from '@/hooks/graphql/profitLink';
import { formatAgo, monthDay, shortWon, won } from '@/lib/format';
import { sourceColor, sourceName } from '@/lib/labels';
import { kstDaysAgo, toKstDateString, toStatsDateRange } from '@/utils/date';

// 수익 90%가 고가전자 (노트북/GPU/TV/가전) — 작업 큐 기본 필터
const HIGH_VALUE_CATEGORY_IDS = [1, 6, 9];

// 오늘(KST) 포함 최근 days 일 — exclusive 종료일 처리는 공용 헬퍼가 한다
const dateRangeOf = (days: number) => toStatsDateRange(kstDaysAgo(days), toKstDateString());

/** 날짜·이름 행 → 이름별 계열 (빈 날은 0). 합이 큰 이름부터 */
const toSeries = <T,>(
  rows: T[],
  dateOf: (r: T) => string,
  keyOf: (r: T) => string,
  valueOf: (r: T) => number,
) => {
  const dates = [...new Set(rows.map(dateOf))].sort();
  const totals = new Map<string, number>();
  const byKey = new Map<string, number>();
  rows.forEach((r) => {
    totals.set(keyOf(r), (totals.get(keyOf(r)) ?? 0) + valueOf(r));
    byKey.set(`${keyOf(r)}|${dateOf(r)}`, valueOf(r));
  });
  const keys = [...totals.keys()].sort((a, b) => (totals.get(b) ?? 0) - (totals.get(a) ?? 0));
  return {
    categories: dates.map(monthDay),
    keys,
    totals: keys.map((k) => ({ key: k, value: totals.get(k) ?? 0 })),
    series: keys.map((k) => ({
      name: sourceName(k),
      data: dates.map((d) => byKey.get(`${k}|${d}`) ?? 0),
    })),
  };
};

const Mini = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="text-[11px] text-bodydark2">{label}</p>
    <p className="flex items-center gap-1.5 text-sm font-semibold text-black dark:text-white">
      {children}
    </p>
  </div>
);

// ─── 1. 출처별 상태 ───

const ProviderHealthSection = () => {
  const { data, loading } = useProfitLinkProviderHealth();
  const rows = data?.profitLinkProviderHealth ?? [];

  const issueLevel = (issued24h: number, issued7d: number): StatusLevel =>
    issued24h > 0 ? 'ok' : issued7d > 0 ? 'warn' : 'danger';

  // 판매 판정은 서버(salesHealth)가 배치 알람과 같은 기준으로 내린다 — 여기서 다시
  // 판정하지 않는다. 예전엔 `sales7d > 0` 이라는 자체 기준이라, 원래 드문 쿠팡(90일 중
  // 판매일 5일)이 상시 노란불이었고 사람이 매번 "쿠팡은 원래 저래" 하고 넘겨야 했다.
  const saleDotLevel: Record<string, StatusLevel> = { ok: 'ok', silent: 'danger', sparse: 'muted' };

  return (
    <ChartCard title="출처별 상태 — 발급·판매가 엇갈리면 사고" loading={loading}>
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => {
          // 발급 1건이 30일간 번 커미션 — 발급·노출을 어디에 더 쓸지의 지표
          const perIssue =
            row.commission30d != null && row.issued30d ? row.commission30d / row.issued30d : null;
          return (
            <li
              key={row.provider}
              className="rounded-lg border border-stroke p-3 dark:border-strokedark"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-semibold text-black dark:text-white">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ background: sourceColor(row.provider) }}
                  />
                  {sourceName(row.provider)}
                </span>
                {row.salesHealth === 'sparse' && (
                  <span className="rounded bg-gray-2 px-1.5 py-0.5 text-[11px] text-bodydark2 dark:bg-meta-4">
                    판매 드묾 · 90일 중 {row.activeDays90d}일
                  </span>
                )}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-x-2 gap-y-2">
                <Mini label="발급 24시간">
                  <StatusDot level={issueLevel(row.issued24h, row.issued7d)} />
                  {row.issued24h.toLocaleString()}
                </Mini>
                <Mini label="판매 24시간">
                  <StatusDot level={saleDotLevel[row.salesHealth] ?? 'muted'} />
                  {row.sales24h.toLocaleString()}
                </Mini>
                <Mini label="판매 30일">{row.sales30d.toLocaleString()}</Mini>
                <Mini label="발급 7일">{row.issued7d.toLocaleString()}</Mini>
                <Mini label="커미션 30일">{shortWon(row.commission30d)}</Mini>
                <Mini label="발급 1건당">{perIssue == null ? '-' : won(perIssue)}</Mini>
              </div>
              <p className="mt-2 text-[11px] text-bodydark2">
                마지막 발급 {formatAgo(row.lastIssuedProductAt)} · 마지막 판매 수신{' '}
                {formatAgo(row.lastSaleAt)}
              </p>
            </li>
          );
        })}
      </ul>
      <details className="mt-3 text-xs text-bodydark2">
        <summary className="cursor-pointer">점 색은 어떻게 정하나</summary>
        <p className="mt-1 leading-relaxed">
          판매는 콜백·폴링을 <b>받은</b> 시각 기준이고, 서버가 배치 알람과 같은 기준으로 판정한다.
          <b> 빨강</b>=14일 넘게 판매 소식 없음(사고, 제휴사 콘솔 확인), <b>회색</b>=원래 드물어
          판정 안 함. 2026-09-13 실측 정상 최대 공백: 링크프라이스 2일 · 애드픽/토스/네이버 6일 ·
          알리 7일 · 쿠팡 17일. 커미션은 수수료 총액 추정치(세전).
        </p>
      </details>
    </ChartCard>
  );
};

// ─── 2. 재시도 대기열 ───

const QueueHealthSection = () => {
  const { data, loading } = useProfitLinkQueueHealth();
  const queue = data?.profitLinkQueueHealth;
  const n = (v?: number | null) => v?.toLocaleString() ?? '-';

  return (
    <ChartCard title="재시도 대기열 — 최근 90일 미발급" loading={loading}>
      <StatTiles
        items={[
          { label: '지금 재시도 가능', value: n(queue?.eligibleNow) },
          { label: '대기 중', value: n(queue?.waitingBackoff), hint: '재시도 간격 기다리는 중' },
          { label: '재시도 포기', value: n(queue?.parked), hint: '시도 횟수 소진' },
          { label: '발급 안 되는 몰', value: n(queue?.terminalDisabled) },
        ]}
      />
      <p className="mt-3 text-xs text-bodydark2">
        가장 오래 기다린 딜: {formatAgo(queue?.oldestEligibleCreatedAt)}
      </p>
      {queue && queue.attemptsDistribution.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {queue.attemptsDistribution.map((entry) => (
            <span
              key={entry.attempts}
              className="rounded bg-gray-2 px-2 py-1 text-xs text-black dark:bg-meta-4 dark:text-white"
            >
              {entry.attempts}번 시도 {entry.count.toLocaleString()}건
            </span>
          ))}
        </div>
      )}
    </ChartCard>
  );
};

// ─── 3. 발급 현황 + 미발급 사유 ───

const DAY_OPTIONS = [
  { value: '7', label: '7일' },
  { value: '14', label: '14일' },
  { value: '30', label: '30일' },
] as const;

const FunnelSection = () => {
  const [days, setDays] = useState<'7' | '14' | '30'>('14');
  const range = useMemo(() => dateRangeOf(Number(days)), [days]);
  const { data: funnelData, loading: funnelLoading } = useProfitLinkFunnelDaily(range);
  const { data: errorData, loading: errorLoading } = useProfitLinkErrorStats({
    ...range,
    limit: 15,
  });

  const funnel = useMemo(() => funnelData?.profitLinkFunnelDaily ?? [], [funnelData]);
  const errors = errorData?.profitLinkErrorStats ?? [];

  const sum = (pick: (d: (typeof funnel)[number]) => number) =>
    funnel.reduce((acc, d) => acc + pick(d), 0);
  const total = sum((d) => d.total);
  const issued = sum((d) => d.issued);
  const pct = (v: number) => (total > 0 ? `${((v / total) * 100).toFixed(1)}%` : undefined);
  const tile = (label: string, v: number, tone?: 'success' | 'danger') => ({
    label,
    value: v.toLocaleString(),
    hint: pct(v),
    tone,
  });

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="min-w-0 xl:col-span-2">
        <ChartCard title="일별 발급 현황" loading={funnelLoading}>
          <SegmentedControl options={DAY_OPTIONS} value={days} onChange={setDays} />
          <div className="mt-3">
            <StatTiles
              cols={3}
              items={[
                { label: `전체 ${days}일`, value: total.toLocaleString() },
                tile('발급 완료', issued, 'success'),
                tile('미발급', total - issued, 'danger'),
                tile(
                  '재시도 중',
                  sum((d) => d.pending),
                ),
                tile(
                  '재시도 포기',
                  sum((d) => d.parked),
                ),
                tile(
                  '발급 안 되는 몰',
                  sum((d) => d.terminal),
                ),
              ]}
            />
          </div>
          <div className="mt-3">
            <Chart
              type="bar"
              stacked
              categories={funnel.map((d) => monthDay(d.date))}
              colors={['#10B981', '#3C50E0', '#F59E0B', '#94A3B8']}
              series={[
                { name: '발급', data: funnel.map((d) => d.issued) },
                { name: '재시도 중', data: funnel.map((d) => d.pending) },
                { name: '포기', data: funnel.map((d) => d.parked) },
                { name: '발급 안 되는 몰', data: funnel.map((d) => d.terminal) },
              ]}
            />
          </div>
          <p className="mt-2 text-xs text-bodydark2">
            오늘 「재시도 중」이 큰 건 정상. 어제 이전의 「포기」 급증이 이상 신호.
          </p>
        </ChartCard>
      </div>
      <ChartCard title="미발급 사유" loading={errorLoading}>
        {errors.length === 0 ? (
          <p className="text-sm text-bodydark2">없음</p>
        ) : (
          <ul className="divide-y divide-stroke dark:divide-strokedark">
            {errors.map((row) => (
              <li key={row.error} className="flex items-start justify-between gap-3 py-2">
                <span className="break-all text-xs text-black dark:text-white">{row.error}</span>
                <span className="shrink-0 text-sm font-semibold text-black dark:text-white">
                  {row.count.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </ChartCard>
    </div>
  );
};

// ─── 4. 수익링크 없이 노출 중인 딜 (작업 큐) ───

const SCOPE_OPTIONS = [
  { value: 'high', label: '고가 전자' },
  { value: 'all', label: '전체' },
] as const;

const MissedProductsSection = () => {
  const [scope, setScope] = useState<'high' | 'all'>('high');
  const [shown, setShown] = useState(10);
  const { data, loading } = useProfitLinkMissedProducts({
    limit: 50,
    categoryIds: scope === 'high' ? HIGH_VALUE_CATEGORY_IDS : undefined,
  });
  const rows = data?.profitLinkMissedProducts ?? [];

  return (
    <ChartCard title="수익링크 없이 노출 중인 딜 — 최근 30일" loading={loading}>
      <SegmentedControl
        options={SCOPE_OPTIONS}
        value={scope}
        onChange={(v) => {
          setScope(v);
          setShown(10);
        }}
      />
      <p className="mt-1.5 text-[11px] text-bodydark2">
        고가 전자 = 노트북·GPU·TV·가전 (수익의 90%)
      </p>
      <ul className="mt-2 divide-y divide-stroke dark:divide-strokedark">
        {rows.slice(0, shown).map((row) => (
          <li key={row.id} className="py-2.5">
            <a
              href={row.detailUrl ?? `https://jirum-alarm.com/products/${row.id}`}
              target="_blank"
              rel="noreferrer"
              className="line-clamp-2 text-sm font-medium text-primary hover:underline"
            >
              {row.title}
            </a>
            <p className="mt-1 flex flex-wrap gap-x-2 text-xs text-body">
              <span>{row.mallName ?? '몰 미상'}</span>
              <span>{row.parsedPrice != null ? won(row.parsedPrice) : '가격 없음'}</span>
              <span>점수 {row.rankingScore?.toFixed(1) ?? '-'}</span>
              <span>{formatAgo(row.createdAt)}</span>
              <span>{row.attempts}번 시도</span>
            </p>
            {row.lastError && <p className="mt-0.5 text-xs text-danger">{row.lastError}</p>}
          </li>
        ))}
      </ul>
      {rows.length > shown && (
        <button
          type="button"
          onClick={() => setShown((v) => v + 20)}
          className="mt-2 w-full rounded-lg border border-stroke py-2 text-sm font-medium text-body dark:border-strokedark"
        >
          더 보기 ({rows.length - shown}건)
        </button>
      )}
    </ChartCard>
  );
};

// ─── 5. 수익 추이 (세후) — 제휴 + 애드센스 ───

const RevenueTrendSection = () => {
  const range = useMemo(() => dateRangeOf(30), []);
  const { data, loading } = useRevenueTrend(range);
  const view = useMemo(
    () =>
      toSeries(
        data?.revenueTrend ?? [],
        (r) => r.date.slice(0, 10),
        (r) => r.source,
        (r) => r.revenue,
      ),
    [data],
  );
  const grandTotal = view.totals.reduce((acc, t) => acc + t.value, 0);

  return (
    <ChartCard title="수익 추이 30일 — 세후, 제휴 + 애드센스" loading={loading}>
      <p className="text-2xl font-bold text-black dark:text-white">{won(grandTotal)}</p>
      <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-body">
        {view.totals.map((t) => (
          <span key={t.key} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm" style={{ background: sourceColor(t.key) }} />
            {sourceName(t.key)} {shortWon(t.value)}
          </span>
        ))}
      </p>
      <div className="mt-3">
        <Chart
          type="bar"
          stacked
          categories={view.categories}
          series={view.series}
          colors={view.keys.map(sourceColor)}
          format={(v) => won(v)}
          options={{ legend: { show: false } }}
        />
      </div>
      <p className="mt-2 text-xs text-bodydark2">
        결제일 기준·취소 제외. 토스는 원천징수 3.3% 뺀 금액이고 실제 지급은 구매확정월이라 날짜가
        밀린다. 애드센스는 GA4 추정치. 쿠팡·네이버는 하루, 애드센스는 이틀 늦게 들어온다.
      </p>
    </ChartCard>
  );
};

// ─── 6. 판매 건수 추이 (참고용) ───

const SalesTrendSection = () => {
  const range = useMemo(() => dateRangeOf(30), []);
  const { data, loading } = useAffiliateSalesTrend(range);
  const view = useMemo(
    () =>
      toSeries(
        data?.affiliateSalesTrend ?? [],
        (r) => r.date.slice(0, 10),
        (r) => r.provider,
        (r) => r.count,
      ),
    [data],
  );

  return (
    <ChartCard title="판매 건수 추이 30일 — 추세 감시용" loading={loading}>
      <Chart
        type="line"
        categories={view.categories}
        series={view.series}
        colors={view.keys.map(sourceColor)}
        format={(v) => `${v}건`}
      />
      <p className="mt-2 text-xs text-bodydark2">
        커미션이 정산 전 추정치라 금액은 믿지 말고, 건수가 평소보다 꺾이는지만 본다.
      </p>
    </ChartCard>
  );
};

const ProfitLinkDashboard = () => (
  <div className="flex flex-col gap-6">
    <ProviderHealthSection />
    <QueueHealthSection />
    <FunnelSection />
    <MissedProductsSection />
    <RevenueTrendSection />
    <SalesTrendSection />
  </div>
);

export default ProfitLinkDashboard;
