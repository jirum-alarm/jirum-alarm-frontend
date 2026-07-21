'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';

import ChartCard from '@/app/stats/components/ChartCard';
import {
  useAffiliateSalesTrend,
  useProfitLinkErrorStats,
  useProfitLinkFunnelDaily,
  useProfitLinkMissedProducts,
  useProfitLinkProviderHealth,
  useProfitLinkQueueHealth,
} from '@/hooks/graphql/profitLink';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// 수익 90%가 고가전자 (노트북/GPU/TV/가전) — 작업 큐 기본 필터
const HIGH_VALUE_CATEGORY_IDS = [1, 6, 9];

const dateRangeOf = (days: number) => {
  const end = new Date();
  end.setDate(end.getDate() + 1); // endDate exclusive → 오늘 포함
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
};

const formatAgo = (iso?: string) => {
  if (!iso) return '-';
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
};

const formatKrw = (value?: number) =>
  value == null ? '-' : `${Math.round(value).toLocaleString()}원`;

const StatusDot = ({ level }: { level: 'ok' | 'warn' | 'danger' }) => (
  <span
    className={`inline-block h-2.5 w-2.5 rounded-full ${
      level === 'ok' ? 'bg-success' : level === 'warn' ? 'bg-warning' : 'bg-danger'
    }`}
  />
);

const thClass = 'px-3 py-2 text-left text-xs font-semibold uppercase text-bodydark2';
const tdClass = 'px-3 py-2 text-sm text-black dark:text-white';

// ─── 1. provider 생존 신호 ───

const ProviderHealthSection = () => {
  const { data, loading } = useProfitLinkProviderHealth();
  const rows = data?.profitLinkProviderHealth ?? [];

  const issueLevel = (issued24h: number, issued7d: number) =>
    issued24h > 0 ? 'ok' : issued7d > 0 ? 'warn' : 'danger';
  const saleLevel = (sales7d: number, sales30d: number) =>
    sales7d > 0 ? 'ok' : sales30d > 0 ? 'warn' : 'danger';

  return (
    <ChartCard title="Provider 생존 신호 — 발급·판매 비대칭이 사고 신호" loading={loading}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stroke dark:border-strokedark">
              <th className={thClass}>Provider</th>
              <th className={thClass}>발급 24h</th>
              <th className={thClass}>발급 7d</th>
              <th className={thClass}>마지막 발급딜</th>
              <th className={thClass}>판매 24h</th>
              <th className={thClass}>판매 7d</th>
              <th className={thClass}>판매 30d</th>
              <th className={thClass}>마지막 판매 수신</th>
              <th className={thClass}>7d 커미션(GROSS)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.provider} className="border-b border-stroke dark:border-strokedark">
                <td className={`${tdClass} font-medium`}>{row.provider}</td>
                <td className={tdClass}>
                  <span className="flex items-center gap-2">
                    <StatusDot level={issueLevel(row.issued24h, row.issued7d)} />
                    {row.issued24h.toLocaleString()}
                  </span>
                </td>
                <td className={tdClass}>{row.issued7d.toLocaleString()}</td>
                <td className={tdClass}>{formatAgo(row.lastIssuedProductAt)}</td>
                <td className={tdClass}>
                  <span className="flex items-center gap-2">
                    <StatusDot level={saleLevel(row.sales7d, row.sales30d)} />
                    {row.sales24h.toLocaleString()}
                  </span>
                </td>
                <td className={tdClass}>{row.sales7d.toLocaleString()}</td>
                <td className={tdClass}>{row.sales30d.toLocaleString()}</td>
                <td className={tdClass}>{formatAgo(row.lastSaleAt)}</td>
                <td className={tdClass}>{formatKrw(row.commission7d)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-bodydark2">
        판매 시각은 postback/폴링 <b>수신</b> 기준 — 발급은 도는데 판매 수신이 오래 침묵하면 (알리
        postback 사망 패턴) provider 콘솔부터 확인. provider별 정상 판매 주기가 다름 (토스 폴링
        ~4일, 쿠팡 ~30일 정산).
      </p>
    </ChartCard>
  );
};

// ─── 2. retry 큐 건강도 ───

const QueueHealthSection = () => {
  const { data, loading } = useProfitLinkQueueHealth();
  const queue = data?.profitLinkQueueHealth;

  const cards = [
    { label: '지금 재시도 가능', value: queue?.eligibleNow, hint: 'host 제외 미반영 근사' },
    { label: 'backoff 대기', value: queue?.waitingBackoff },
    { label: 'parked (attempts 소진)', value: queue?.parked },
    { label: "terminal ('disabled')", value: queue?.terminalDisabled },
  ];

  return (
    <ChartCard title="Retry 큐 건강도 (최근 90일 미발급)" loading={loading}>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-stroke p-4 dark:border-strokedark"
          >
            <p className="text-xs text-bodydark2">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-black dark:text-white">
              {card.value?.toLocaleString() ?? '-'}
            </p>
            {card.hint && <p className="text-xs text-bodydark2">{card.hint}</p>}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-black dark:text-white">
        <span className="text-xs text-bodydark2">attempts 분포:</span>
        {queue?.attemptsDistribution.map((entry) => (
          <span key={entry.attempts} className="rounded bg-gray-2 px-2 py-1 text-xs dark:bg-meta-4">
            {entry.attempts}회 → {entry.count.toLocaleString()}
          </span>
        ))}
        <span className="text-xs text-bodydark2">
          최고령 대기 딜: {formatAgo(queue?.oldestEligibleCreatedAt)}
        </span>
      </div>
    </ChartCard>
  );
};

// ─── 3. 발급 퍼널 + 에러 사유 ───

const FunnelSection = () => {
  const [days, setDays] = useState(14);
  const range = useMemo(() => dateRangeOf(days), [days]);
  const { data: funnelData, loading: funnelLoading } = useProfitLinkFunnelDaily(range);
  const { data: errorData, loading: errorLoading } = useProfitLinkErrorStats({
    ...range,
    limit: 15,
  });

  const funnel = funnelData?.profitLinkFunnelDaily ?? [];
  const errors = errorData?.profitLinkErrorStats ?? [];

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="xl:col-span-2">
        <ChartCard title="일별 발급 퍼널" loading={funnelLoading}>
          <div className="mb-3 flex gap-2">
            {[7, 14, 30].map((option) => (
              <button
                key={option}
                onClick={() => setDays(option)}
                className={`rounded px-3 py-1 text-xs ${
                  days === option
                    ? 'bg-primary text-white'
                    : 'bg-gray-2 text-bodydark2 dark:bg-meta-4'
                }`}
              >
                {option}일
              </button>
            ))}
          </div>
          {funnel.length > 0 && (
            <Chart
              type="bar"
              height={350}
              options={{
                chart: { stacked: true, toolbar: { show: false } },
                xaxis: { categories: funnel.map((d) => d.date.slice(5)) },
                legend: { position: 'top' },
                colors: ['#10B981', '#3C50E0', '#F59E0B', '#94A3B8'],
                dataLabels: { enabled: false },
              }}
              series={[
                { name: '발급', data: funnel.map((d) => d.issued) },
                { name: 'pending', data: funnel.map((d) => d.pending) },
                { name: 'parked', data: funnel.map((d) => d.parked) },
                { name: 'terminal', data: funnel.map((d) => d.terminal) },
              ]}
            />
          )}
          <p className="mt-2 text-xs text-bodydark2">
            오늘 pending 이 큰 건 정상 (재시도 진행 중). 어제 이전의 parked 급증이 이상 신호.
          </p>
        </ChartCard>
      </div>
      <ChartCard title="미발급 lastError 사유" loading={errorLoading}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-stroke dark:border-strokedark">
              <th className={thClass}>사유</th>
              <th className={`${thClass} text-right`}>건수</th>
            </tr>
          </thead>
          <tbody>
            {errors.map((row) => (
              <tr key={row.error} className="border-b border-stroke dark:border-strokedark">
                <td className={`${tdClass} font-mono break-all text-xs`}>{row.error}</td>
                <td className={`${tdClass} text-right`}>{row.count.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ChartCard>
    </div>
  );
};

// ─── 4. 노출되는데 링크 없는 딜 (작업 큐) ───

const MissedProductsSection = () => {
  const [highValueOnly, setHighValueOnly] = useState(true);
  const { data, loading } = useProfitLinkMissedProducts({
    limit: 50,
    categoryIds: highValueOnly ? HIGH_VALUE_CATEGORY_IDS : undefined,
  });
  const rows = data?.profitLinkMissedProducts ?? [];

  return (
    <ChartCard title="노출 가능한데 수익링크 없는 딜 (최근 30일·미종료)" loading={loading}>
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => setHighValueOnly(true)}
          className={`rounded px-3 py-1 text-xs ${
            highValueOnly ? 'bg-primary text-white' : 'bg-gray-2 text-bodydark2 dark:bg-meta-4'
          }`}
        >
          고가전자 (cat 1·6·9)
        </button>
        <button
          onClick={() => setHighValueOnly(false)}
          className={`rounded px-3 py-1 text-xs ${
            !highValueOnly ? 'bg-primary text-white' : 'bg-gray-2 text-bodydark2 dark:bg-meta-4'
          }`}
        >
          전체
        </button>
      </div>
      <div className="max-h-[500px] overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stroke dark:border-strokedark">
              <th className={thClass}>딜</th>
              <th className={thClass}>몰</th>
              <th className={`${thClass} text-right`}>가격</th>
              <th className={`${thClass} text-right`}>랭킹점수</th>
              <th className={thClass}>생성</th>
              <th className={`${thClass} text-right`}>attempts</th>
              <th className={thClass}>lastError</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-stroke dark:border-strokedark">
                <td className={`${tdClass} max-w-[400px]`}>
                  <a
                    href={row.detailUrl ?? `https://jirum-alarm.com/products/${row.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="line-clamp-1 text-primary hover:underline"
                  >
                    {row.title}
                  </a>
                </td>
                <td className={tdClass}>{row.mallName ?? '-'}</td>
                <td className={`${tdClass} text-right`}>
                  {row.parsedPrice != null ? `${row.parsedPrice.toLocaleString()}원` : '-'}
                </td>
                <td className={`${tdClass} text-right`}>{row.rankingScore?.toFixed(1) ?? '-'}</td>
                <td className={tdClass}>{formatAgo(row.createdAt)}</td>
                <td className={`${tdClass} text-right`}>{row.attempts}</td>
                <td className={`${tdClass} font-mono text-xs`}>{row.lastError ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
};

// ─── 5. 판매 추이 (참고용) ───

const SalesTrendSection = () => {
  const range = useMemo(() => dateRangeOf(30), []);
  const { data, loading } = useAffiliateSalesTrend(range);
  const { dates, series } = useMemo(() => {
    const rows = data?.affiliateSalesTrend ?? [];
    const dateSet = [...new Set(rows.map((row) => row.date))].sort();
    const providers = [...new Set(rows.map((row) => row.provider))].sort();
    const countByKey = new Map(rows.map((row) => [`${row.provider}|${row.date}`, row.count]));
    return {
      dates: dateSet,
      series: providers.map((provider) => ({
        name: provider,
        data: dateSet.map((date) => countByKey.get(`${provider}|${date}`) ?? 0),
      })),
    };
  }, [data]);

  return (
    <ChartCard title="판매 추이 30일 — 추세 감시용 (절대값 신뢰 금지)" loading={loading}>
      {dates.length > 0 && (
        <Chart
          type="line"
          height={300}
          options={{
            chart: { toolbar: { show: false } },
            xaxis: { categories: dates.map((d) => d.slice(5)) },
            legend: { position: 'top' },
            stroke: { curve: 'smooth', width: 2 },
            dataLabels: { enabled: false },
          }}
          series={series}
        />
      )}
      <p className="mt-2 text-xs text-bodydark2">
        commission 은 GROSS 추정 + status 정산 단계 부재라 절대 수익이 아님. 건수 추세가 평소 대비
        꺾이는지만 본다.
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
    <SalesTrendSection />
  </div>
);

export default ProfitLinkDashboard;
