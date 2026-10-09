'use client';

import Link from 'next/link';

import { getHealthLevel } from '@/app/(admin)/crawling/components/ProviderHealthGrid';
import { ProductMappingMatchStatus, ProductMappingTarget } from '@/generated/gql/graphql';
import { useMyAdminAccess } from '@/hooks/graphql/permission';
import {
  useProfitLinkProviderHealth,
  useQueryHasKakaoSession,
  useQueryHasOhouSession,
  useQueryHasThreeHaSession,
  useQueryHasTossSession,
} from '@/hooks/graphql/profitLink';
import { useProviderHealthStatus } from '@/hooks/graphql/stats';
import { useGetPendingVerificationsTotalCount } from '@/hooks/graphql/verification';
import { canAccessPath } from '@/lib/adminSection';
import { sourceName } from '@/lib/labels';
import { ProviderType } from '@/types/stats';

/**
 * 홈 맨 위 '지금 확인할 것' — 손이 가야 하는 일만 숫자로 보여주고 해결 화면으로 보낸다.
 * 판정 기준은 각 화면 것을 그대로 쓴다(크롤러=ProviderHealthGrid 임계치, 판매=서버 salesHealth).
 * 권한 없는 섹션은 쿼리 자체를 안 보낸다(보내면 FORBIDDEN 배너가 뜬다).
 */
const AttentionStrip = () => {
  const { data: accessData } = useMyAdminAccess();
  const access = accessData?.myAdminAccess;
  const canProduct = canAccessPath(access, '/product/matching');
  const canCrawling = canAccessPath(access, '/crawling');
  const canProfit = canAccessPath(access, '/profit-link');

  const matching = useGetPendingVerificationsTotalCount(
    { matchStatus: [ProductMappingMatchStatus.Matched], target: ProductMappingTarget.BrandProduct },
    { skip: !canProduct },
  );
  // 크롤링 화면 그리드와 같은 범위(커뮤니티만) — 다르면 홈과 크롤링 화면의 숫자가 어긋난다
  const crawl = useProviderHealthStatus(
    { providerType: ProviderType.COMMUNITY },
    { skip: !canCrawling },
  );
  const sales = useProfitLinkProviderHealth({ skip: !canProfit });
  const toss = useQueryHasTossSession({ skip: !canProfit });
  const ohou = useQueryHasOhouSession({ skip: !canProfit });
  const kakao = useQueryHasKakaoSession({ skip: !canProfit });
  const threeHa = useQueryHasThreeHaSession({ skip: !canProfit });

  const crawlDown = (crawl.data?.providerHealthStatus ?? [])
    .filter((p) => getHealthLevel(p) !== 'healthy')
    .map((p) => p.providerName);
  const salesSilent = (sales.data?.profitLinkProviderHealth ?? [])
    .filter((r) => r.salesHealth === 'silent')
    .map((r) => sourceName(r.provider));
  // 응답이 false 일 때만 만료로 센다(로딩·에러로 undefined 인 걸 만료로 오인하지 않게)
  const sessionsExpired = [
    ['토스', toss.data?.hasTossSession],
    ['오늘의집', ohou.data?.hasOhouSession],
    ['카카오쇼핑', kakao.data?.hasKakaoSession],
    ['세시간전', threeHa.data?.hasThreeHaSession],
  ]
    .filter(([, has]) => has === false)
    .map(([name]) => name as string);

  const tiles = [
    canProduct && {
      label: '매칭 검수 대기',
      href: '/product/matching',
      loading: matching.loading,
      count: matching.data?.pendingVerificationsTotalCount,
      unit: '건',
      // 늘 수만 건 쌓여 있는 작업 큐라 경고색이 아니라 '할 일'로 보여준다
      backlog: true,
    },
    canCrawling && {
      label: '수집 멈춘 크롤러',
      href: '/crawling',
      loading: crawl.loading,
      count: crawl.data ? crawlDown.length : undefined,
      detail: crawlDown,
      unit: '곳',
    },
    canProfit && {
      label: '만료된 수익링크 세션',
      href: '/profit-link',
      loading: toss.loading || ohou.loading || kakao.loading || threeHa.loading,
      count:
        toss.data && ohou.data && kakao.data && threeHa.data ? sessionsExpired.length : undefined,
      detail: sessionsExpired,
      unit: '곳',
    },
    canProfit && {
      label: '판매 끊긴 몰',
      href: '/profit-link',
      loading: sales.loading,
      count: sales.data ? salesSilent.length : undefined,
      detail: salesSilent,
      unit: '곳',
    },
  ].filter(Boolean) as {
    label: string;
    href: string;
    loading: boolean;
    count?: number;
    detail?: string[];
    unit: string;
    backlog?: boolean;
  }[];

  if (tiles.length === 0) return null;

  return (
    <section className="mb-6">
      <h3 className="mb-2 text-sm font-semibold text-bodydark2">지금 확인할 것</h3>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => {
          const alert = !t.backlog && (t.count ?? 0) > 0;
          return (
            <Link
              key={t.label}
              href={t.href}
              className={`rounded-lg border bg-white p-4 shadow-default active:opacity-80 ${
                alert ? 'border-danger/50' : 'border-stroke'
              }`}
            >
              <p className="text-xs font-medium text-body">{t.label}</p>
              <p
                className={`mt-1 text-2xl font-bold ${alert ? 'text-danger' : t.backlog ? 'text-primary' : 'text-black'}`}
              >
                {t.loading && t.count === undefined
                  ? '…'
                  : t.count === undefined
                    ? '-'
                    : `${t.count.toLocaleString()}${t.unit}`}
              </p>
              {t.detail && t.detail.length > 0 && (
                <p className="mt-1 truncate text-xs text-danger">{t.detail.join(', ')}</p>
              )}
              {t.detail && t.count === 0 && <p className="mt-1 text-xs text-success">정상</p>}
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default AttentionStrip;
