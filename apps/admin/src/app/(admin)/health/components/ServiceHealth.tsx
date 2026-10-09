'use client';

import { useQuery } from '@apollo/client/react';
import Link from 'next/link';

import Panel from '@/components/Panel';
import StatusDot, { StatusLevel } from '@/components/StatusDot';
import {
  DateInterval,
  ProductMappingMatchStatus,
  ProductMappingTarget,
  QuerySearchProbeQuery,
  QuerySearchProbeQueryVariables,
  QueryThumbnailStatsQuery,
  QueryThumbnailStatsQueryVariables,
} from '@/generated/gql/graphql';
import { QuerySearchProbe, QueryThumbnailStats } from '@/graphql/stats';
import {
  useProfitLinkProviderHealth,
  useProfitLinkQueueHealth,
  useQueryHasKakaoSession,
  useQueryHasNaverBcSession,
  useQueryHasOhouSession,
  useQueryHasTossSession,
  useRevenueTrend,
} from '@/hooks/graphql/profitLink';
import { useProviderHealthStatus } from '@/hooks/graphql/stats';
import { useGetPendingVerificationsTotalCount } from '@/hooks/graphql/verification';
import { ProviderType } from '@/types/stats';
import { kstDaysAgo, toKstDateString, toStatsDateRange } from '@/utils/date';

import { buildSections, Check, Level } from '../lib/checks';

const DOT: Record<Level, StatusLevel> = {
  danger: 'danger',
  warn: 'warn',
  ok: 'ok',
  manual: 'muted',
};
const LEVEL_LABEL: Record<Level, string> = {
  danger: '문제',
  warn: '주의',
  ok: '정상',
  manual: '직접 확인',
};
const LEVEL_TEXT: Record<Level, string> = {
  danger: 'text-danger',
  warn: 'text-warning',
  ok: 'text-body',
  manual: 'text-bodydark2',
};

/** `코드` 를 <code> 로 — 점검표 문구는 데이터라 마크업 대신 백틱만 쓴다 */
const Text = ({ children }: { children: string }) => (
  <>
    {children.split('`').map((part, i) =>
      i % 2 === 1 ? (
        <code key={i} className="rounded-xs bg-gray-2 px-1 dark:bg-meta-4">
          {part}
        </code>
      ) : (
        part
      ),
    )}
  </>
);

const Steps = ({ label, items }: { label: string; items: string[] }) => (
  <div>
    <p className="text-xs font-semibold text-black dark:text-white">{label}</p>
    <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-relaxed text-body">
      {items.map((t) => (
        <li key={t}>
          <Text>{t}</Text>
        </li>
      ))}
    </ul>
  </div>
);

const CheckRow = ({ c }: { c: Check }) => (
  // 문제인 칸은 펼친 채로 — 눌러야 절차가 보이면 급할 때 한 번 더 헤맨다
  <details id={c.id} open={c.level === 'danger'} className="group scroll-mt-20 py-3">
    <summary className="flex cursor-pointer list-none items-start gap-2.5">
      <span className="mt-1.5">
        {c.level ? <StatusDot level={DOT[c.level]} /> : <StatusDot level="muted" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="font-medium text-black dark:text-white">{c.title}</span>
          <span className={`shrink-0 text-xs ${c.level ? LEVEL_TEXT[c.level] : 'text-bodydark2'}`}>
            {c.level ? LEVEL_LABEL[c.level] : '확인 중…'}
          </span>
        </span>
        {c.now && <span className="mt-0.5 block text-xs text-body">{c.now}</span>}
      </span>
      <span className="mt-1 text-xs text-bodydark2 group-open:rotate-90">›</span>
    </summary>
    <div className="mt-3 ml-5 space-y-3 rounded-lg bg-gray-2 p-3 dark:bg-meta-4">
      <p className="text-xs leading-relaxed text-body">
        <span className="font-semibold text-black dark:text-white">깨지면 </span>
        <Text>{c.symptom}</Text>
      </p>
      <Steps label="확인" items={c.check} />
      <Steps label="고치기" items={c.fix} />
      {c.href && (
        <Link
          href={c.href}
          className="inline-block rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-white"
        >
          해결 화면으로 ›
        </Link>
      )}
    </div>
  </details>
);

/**
 * 서비스 점검 — 깨졌을 때 볼 것·고칠 것을 중요도(수익 → 크롤러 → …) 순으로 한 화면에.
 * 신호는 각 화면이 쓰는 쿼리를 그대로 쓴다(판정이 화면마다 달라지지 않게). 1분마다 새로 받는다.
 */
const ServiceHealth = () => {
  const poll = { pollInterval: 60_000 };
  const toss = useQueryHasTossSession(poll);
  const naverBc = useQueryHasNaverBcSession(poll);
  const ohou = useQueryHasOhouSession(poll);
  const kakao = useQueryHasKakaoSession(poll);
  const profit = useProfitLinkProviderHealth(poll);
  const queue = useProfitLinkQueueHealth();
  const community = useProviderHealthStatus({ providerType: ProviderType.COMMUNITY });
  const mall = useProviderHealthStatus({ providerType: ProviderType.MALL });
  const danawa = useProviderHealthStatus({ providerType: ProviderType.DANAWA });
  const matching = useGetPendingVerificationsTotalCount({
    matchStatus: [ProductMappingMatchStatus.Matched],
    target: ProductMappingTarget.BrandProduct,
  });

  // 어제·오늘은 정산이 덜 찬 값이라(쿠팡·네이버 하루 뒤, 애드센스 이틀 뒤) 그저께까지 7일
  const revenue = useRevenueTrend(toStatsDateRange(kstDaysAgo(8), kstDaysAgo(2)));
  const thumbRange = toStatsDateRange(kstDaysAgo(1), toKstDateString());
  const thumb = useQuery<QueryThumbnailStatsQuery, QueryThumbnailStatsQueryVariables>(
    QueryThumbnailStats,
    { variables: { ...thumbRange, interval: DateInterval.Daily }, fetchPolicy: 'network-only' },
  );
  const search = useQuery<QuerySearchProbeQuery, QuerySearchProbeQueryVariables>(QuerySearchProbe, {
    variables: { keyword: '노트북' },
    fetchPolicy: 'network-only',
    ...poll,
  });

  const sections = buildSections({
    toss: toss.data?.hasTossSession,
    naverBc: naverBc.data?.hasNaverBcSession,
    ohou: ohou.data?.hasOhouSession,
    kakao: kakao.data?.hasKakaoSession,
    profit: profit.data?.profitLinkProviderHealth,
    queue: queue.data?.profitLinkQueueHealth,
    revenue7d: revenue.data?.revenueTrend.reduce((acc, r) => acc + r.revenue, 0),
    community: community.data?.providerHealthStatus,
    mall: mall.data?.providerHealthStatus,
    danawa: danawa.data?.providerHealthStatus,
    thumbnail: thumb.data?.thumbnailStats && {
      total: thumb.data.thumbnailStats.totalCount,
      missing: thumb.data.thumbnailStats.missingCount,
    },
    searchHits: search.error ? null : search.data?.products.length,
    pendingMatches: matching.data?.pendingVerificationsTotalCount,
  });

  const all = sections.flatMap((s) => s.checks);
  const count = (lv: Level) => all.filter((c) => c.level === lv).length;
  const urgent = [
    ...all.filter((c) => c.level === 'danger'),
    ...all.filter((c) => c.level === 'warn'),
  ];

  return (
    <div className="flex flex-col gap-6">
      <Panel className="p-4 sm:p-6">
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {(['danger', 'warn', 'ok', 'manual'] as const).map((lv) => (
            <span key={lv} className="flex items-center gap-1.5 text-black dark:text-white">
              <StatusDot level={DOT[lv]} />
              {LEVEL_LABEL[lv]} <b>{count(lv)}</b>
            </span>
          ))}
        </p>
        {urgent.length > 0 ? (
          <ul className="mt-3 space-y-1.5 border-t border-stroke pt-3 dark:border-strokedark">
            {urgent.map((c) => (
              <li key={c.id}>
                <a href={`#${c.id}`} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5">
                    <StatusDot level={DOT[c.level as Level]} />
                  </span>
                  <span>
                    <span className="font-medium text-black dark:text-white">{c.title}</span>
                    {c.now && <span className="ml-1.5 text-xs text-body">{c.now}</span>}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          all.every((c) => c.level) && (
            <p className="mt-3 border-t border-stroke pt-3 text-sm text-success dark:border-strokedark">
              자동으로 볼 수 있는 항목은 모두 정상. 회색은 알람이 왔을 때 펼쳐 보면 된다.
            </p>
          )
        )}
      </Panel>

      {sections.map((section, i) => (
        <section key={section.title}>
          <h3 className="text-base font-semibold text-black dark:text-white">
            {i + 1}. {section.title}
          </h3>
          <p className="mt-0.5 mb-2 text-xs text-bodydark2">{section.why}</p>
          <Panel className="px-4 sm:px-6">
            <div className="divide-y divide-stroke dark:divide-strokedark">
              {section.checks.map((c) => (
                <CheckRow key={c.id} c={c} />
              ))}
            </div>
          </Panel>
        </section>
      ))}
    </div>
  );
};

export default ServiceHealth;
