import { infoBox, text } from '@jirum/design-system/recipes';
import { isKeywordHubToday, splitKeywordHubsByRecency } from '@jirum/domain/keyword-hub';
import { Metadata } from 'next';
import Link from 'next/link';

import { checkDevice } from '@/shared/actions/agent';
import type { KeywordHub } from '@/shared/api/keyword-hub/keyword-hub.service';
import { ModelPageService } from '@/shared/api/model-page';
import { METADATA_SERVICE_URL } from '@/shared/config/env';
import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';
import Badge from '@/shared/ui/common/Badge';

import { fetchKeywordHubs } from '@/entities/keyword-hub/api/fetchKeywordHub';
import {
  buildKeywordHubFacts,
  formatHubCount,
  KEYWORD_HUB_WINDOW_DAYS,
  keywordHubPath,
} from '@/entities/keyword-hub/lib/keyword-hub';

import { relativeTimeLabel } from '@/features/deals/lib/model-page-insights';

import KeywordBoard from '@/widgets/keyword-board/ui/KeywordBoard';

import { FoldedGrid, SectionTitle, splitByVerdict } from '../deals/DealsSections';
import {
  isSeasonHubLinkOn,
  SEASON_HUB_PATH,
  seasonStatus,
} from '../season/2026-black-friday/season-calendar';

import KeywordsTabHeader from './KeywordsTabHeader';

// /keywords — 지름알림의 「모아보기」 첫 화면(2026-10-17 상단 메뉴 「최저가」 자리). 키워드가 위층이다: 알림을 거는 단위와 같아서
// 보다가 그 자리에서 알림으로 이어진다. 모델 페이지(/deals/{slug}, 상품별 가격 판정)는 각 키워드 허브 안의 아래층이고,
// 그중 지금 싼 것만 「지금 사기 좋아요」로 여기 맨 위에 올린다. 키워드에 안 걸리는 모델 페이지까지 다 보는 길은 /deals.

// 빌드 때 정적 생성하지 않는다 — 빌드 API(dev)가 keywordHubs 를 모르면 400 인데, 정적 생성 중 데이터 캐시 붙은 요청이
// 400 을 받으면 응답 본문 읽기가 안 끝나 60초×3 으로 빌드가 죽었다(2026-10-14 deploy-web-staging 실측·로컬 재현).
// 요청 시 렌더해도 데이터 캐시(fetch revalidate)는 그대로라 API 부하는 같다.
export const dynamic = 'force-dynamic';

const title = '키워드별 핫딜 모음 | 지름알림';
const buildDescription = (count: number) =>
  `삼다수·햇반·기저귀·노트북 등 ${count}개 키워드로 커뮤니티 핫딜을 모았어요. 키워드를 누르면 최근 30일 핫딜을 볼 수 있어요.`;

export async function generateMetadata(): Promise<Metadata> {
  const description = buildDescription((await fetchKeywordHubs()).length);
  return {
    title,
    description,
    alternates: { canonical: `${METADATA_SERVICE_URL}/keywords` },
    openGraph: {
      title,
      description,
      url: `${METADATA_SERVICE_URL}/keywords`,
      images: [{ url: `${METADATA_SERVICE_URL}/opengraph-image.webp`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: `${METADATA_SERVICE_URL}/opengraph-image.webp`, width: 1200, height: 630 }],
    },
  };
}

export default async function KeywordHubIndexPage() {
  // 허브는 30일 딜 많은 순(서버 정렬). 모델 페이지 판정이 실패해도 키워드 목록은 그린다 — 이 화면의 본체는 키워드다.
  const [hubs, pages, { isMobile }] = await Promise.all([
    fetchKeywordHubs(),
    ModelPageService.getPublishedModelPages().catch(() => []),
    checkDevice(),
  ]);
  const { buyNow } = splitByVerdict(pages);
  // 나눔은 「마지막 딜이 사흘 안」 — 규칙은 앱 키워드 탭과 같은 @jirum/domain 한 곳(activeDealCount 를 안 쓰는 이유도 거기).
  // eslint-disable-next-line react-hooks/purity -- 서버 컴포넌트(force-dynamic)라 요청마다 한 번 렌더된다. 「사흘 안」의 기준 시각.
  const now = Date.now();
  const { live, quiet } = splitKeywordHubsByRecency(hubs, now);

  return (
    <main className="max-w-mobile-max pc:max-w-layout-max pc:pt-24 mx-auto w-full px-5 pt-14 pb-24">
      <KeywordsTabHeader />
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">키워드별 핫딜 모음</h1>
        <p className="mt-1 text-sm text-gray-600">{buildDescription(hubs.length)}</p>
      </header>
      {/* 하단 탭 「키워드」(2026-10-20) — 내 키워드부터. 2026-10-23 칩 목록 → 상황판(이번 주 올라온 딜·지금 사기 좋은 딜·키워드별 최근 딜).
          계정·키워드는 브라우저가 알아서 클라에서 그린다(이 페이지는 캐시되는 공개 화면). */}
      <KeywordBoard />

      {/* 해외직구 시즌 허브 — 시즌(~12/12) 동안만. 「모아보기」 손님이 직구 일정을 찾는 자리이자 허브의 HTML 크롤 경로(season-calendar 주석). */}
      {isSeasonHubLinkOn(now) && (
        <Link
          href={SEASON_HUB_PATH}
          className={cn('mb-8 flex items-center justify-between gap-3 px-4 py-3', infoBox)}
          data-track="season-hub-link"
          data-source="keyword_index"
        >
          <span className="min-w-0">
            <span className={cn(text.label, 'block')}>2026 블프·광군제 직구 달력</span>
            <span className={cn(text.caption, 'mt-0.5 block')}>
              {seasonStatus(now).label} · 알리 일정과 쿠폰 확인법
            </span>
          </span>
          <span className={cn(text.muted, 'shrink-0')}>보기</span>
        </Link>
      )}

      {buyNow.length > 0 && (
        <section className="mb-12">
          <SectionTitle
            title="지금 사기 좋아요"
            description="진행 중인 핫딜이 그동안의 가격보다 싼 상품이에요."
          />
          <FoldedGrid
            items={buyNow}
            visible={isMobile ? BUY_NOW_VISIBLE_MOBILE : BUY_NOW_VISIBLE_HERE}
          />
        </section>
      )}

      {live.length > 0 && (
        <section className="mb-12">
          <SectionTitle
            title="최근 핫딜이 올라온 키워드"
            description="사흘 안에 핫딜이 올라왔어요. 최근 30일 동안 많이 올라온 순서예요."
          />
          <KeywordHubCards hubs={live} now={now} />
        </section>
      )}

      {quiet.length > 0 && (
        <section className="mb-12">
          <SectionTitle
            title="핫딜을 기다리는 키워드"
            description="한동안 핫딜이 없었어요. 알림을 걸어 두면 다음 딜을 놓치지 않아요."
          />
          <KeywordHubCards hubs={quiet} now={now} />
        </section>
      )}

      <p className="text-center">
        <Link
          href={PAGE.DEALS}
          className={cn(text.muted, 'underline underline-offset-2')}
          data-track="model-page-index-link"
          data-source="keyword_index"
        >
          상품별 최저가 전체 목록{pages.length > 0 ? ` (${pages.length.toLocaleString()}개)` : ''}
        </Link>
      </p>
    </main>
  );
}

/** 이 화면의 본체는 키워드라 판정 카드는 PC 한 줄(5열)만 펼친다 — /deals 처럼 10개면 첫 화면이 상품 카드로 다 찼다(2026-10-17). */
const BUY_NOW_VISIBLE_HERE = 5;
/** 폰은 2열이라 5개면 세 줄 — 하단 탭 「키워드」(2026-10-20)를 눌렀는데 첫 화면이 상품 카드로 찬다. 한 줄만 펼친다. */
const BUY_NOW_VISIBLE_MOBILE = 2;

/** 키워드 한 칸 — 이름·마지막 딜·「30일 N건 · 30일 중 M일 · 주로 X」. 가격은 쓰지 않는다(키워드 안에 다른 상품이 섞인다). */
function KeywordHubCards({ hubs, now }: { hubs: KeywordHub[]; now: number }) {
  return (
    <ul className="pc:grid-cols-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
      {hubs.map((h) => (
        <li key={h.slug}>
          <Link
            href={keywordHubPath(h)}
            className="flex h-full flex-col gap-1 rounded-lg border border-gray-100 px-4 py-3 hover:bg-gray-50"
          >
            <span className="flex items-center justify-between gap-2">
              <span className={cn(text.subtitle, 'truncate')}>{h.name} 핫딜</span>
              {h.lastDealAt && (
                <Badge
                  pill
                  tone={isKeywordHubToday(h.lastDealAt, now) ? 'error' : 'gray'}
                  className="shrink-0"
                >
                  {relativeTimeLabel(h.lastDealAt, now)}
                </Badge>
              )}
            </span>
            <span className={text.caption}>
              {[
                h.recentDealCount > 0
                  ? `최근 ${KEYWORD_HUB_WINDOW_DAYS}일 ${formatHubCount(h)}`
                  : null,
                ...buildKeywordHubFacts(h),
              ]
                .filter(Boolean)
                .join(' · ')}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
