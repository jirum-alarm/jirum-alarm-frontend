import { linkChip, text } from '@jirum/design-system/recipes';
import {
  COMMUNITY_COUNT,
  DAILY_COMMUNITY_DEALS,
  SHOPPING_SOURCES,
  SOURCE_COMMUNITIES,
} from '@jirum/domain/service-facts';
import { Metadata } from 'next';
import Link from 'next/link';

import { checkDevice } from '@/shared/actions/agent';
import { PromotionService } from '@/shared/api/promotion';
import { METADATA_SERVICE_URL } from '@/shared/config/env';
import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';
import { jsonLdHtml } from '@/shared/lib/json-ld';

import DealsMobileHeader from '../../deals/[slug]/DealsMobileHeader';

/**
 * "핫딜 사이트·앱 고르는 법" 안내. «핫딜 사이트»(네이버 월 2.8천)·«핫딜 모음» 질의의 첫 화면은 네이버 AI 브리핑과
 * 구글 AI 개요가 차지하고, 둘 다 «핫딜 사이트가 어떤 것들이고 어떻게 다른가»를 설명한 글을 출처로 쓴다
 * (2026-10-23 실측 — 우리 글은 없었고 경쟁 서비스의 체험 글·정의 글만 인용됐다). 그 질의를 받을 문서다.
 * 다른 서비스는 각자 공개한 소개·스토어 설명에 있는 사실만 갈래의 예로 적고, 남이 못 한다는 말은 쓰지 않는다
 * (경쟁 앱도 근거를 낸다). 지름알림 몫은 /help 와 같은 정본(service-facts)에서 온다.
 */
const PATH = '/guide/hotdeal-sites';
const title = '핫딜 사이트·앱 고르는 법 — 커뮤니티 모음부터 가격 추적까지 | 지름알림';
const description = `핫딜 사이트는 커뮤니티 모음, 쇼핑몰 가격 추적, 모음에 가격 근거를 붙인 서비스 세 갈래예요. 핫딜이 올라오는 커뮤니티 ${COMMUNITY_COUNT}, 고를 때 볼 것 다섯 가지, 지름알림이 어느 칸인지 정리했어요.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${METADATA_SERVICE_URL}${PATH}` },
  openGraph: {
    title,
    description,
    url: `${METADATA_SERVICE_URL}${PATH}`,
    type: 'article',
    images: [{ url: `${METADATA_SERVICE_URL}/opengraph-image.webp`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [{ url: `${METADATA_SERVICE_URL}/opengraph-image.webp`, width: 1200, height: 630 }],
  },
};

// 세 갈래 — 각 서비스의 공개 소개·스토어 설명 기준(2026-10-21 조사). 예시는 그 갈래를 알아보기 위한 이름이고 순위가 아니다.
const KINDS = [
  {
    name: '커뮤니티 모음',
    what: '뽐뿌·에펨코리아 같은 커뮤니티 핫딜 게시판 글을 한 화면에 모으고, 키워드 알림을 보내 줘요. 싼지 판단은 글의 추천·댓글을 보고 직접 해요.',
    examples: '알구몬 · 핫딜알림 · 꿀소식',
  },
  {
    name: '쇼핑몰 가격 추적',
    what: '쿠팡·네이버 같은 쇼핑몰 상품의 가격 변동을 그래프로 보여 주고, 목표가에 닿으면 알려 줘요. 커뮤니티 핫딜은 다루지 않아요.',
    examples: '폴센트 · 다나와 · 에누리',
  },
  {
    name: '모음 + 가격 근거',
    what: '커뮤니티 핫딜을 모으면서 「지금 가격이 싼지」 근거를 붙여요. 근거의 기준(쇼핑몰 정가, 같은 상품의 지난 핫딜가, 평균 대비)은 서비스마다 달라요.',
    examples: '지름알림 · 핫구사 · 덥석 · 두더지',
  },
];

const CHECKS = [
  {
    name: '어디서, 얼마나 빨리 모으나',
    text: '모으는 커뮤니티 수와 새 글이 알림으로 오기까지의 지연이에요. 핫딜은 몇 시간이면 끝나서 늦게 온 알림은 품절 알림이에요.',
  },
  {
    name: '같은 상품인지 가려 주나',
    text: '키워드만 맞으면 「콜라」에 「콜라겐」이 와요. 제외 단어·가격 범위 조건이 있는지, 같은 상품의 재게시를 걸러 주는지 봐요.',
  },
  {
    name: '「싸다」의 기준이 무엇인가',
    text: '쇼핑몰 정가 대비 할인율은 정가가 부풀려지면 의미가 없어요. 같은 상품이 지난 핫딜에서 얼마였는지, 다른 쇼핑몰 최저가는 얼마인지로 보여 주는지 확인해요.',
  },
  {
    name: '알림을 조절할 수 있나',
    text: '밤에는 모아서 받기, 관심 카테고리만 받기, 좋은 가격일 때만 받기처럼 알림 양을 줄이는 장치가 있어야 오래 켜 둘 수 있어요.',
  },
  {
    name: '어디서 받나',
    text: '앱 푸시만 되는지, 웹 브라우저·카카오톡 오픈채팅처럼 앱 없이 받는 길도 있는지에 따라 쓰는 방식이 달라져요.',
  },
];

const FAQ = [
  {
    q: '핫딜 사이트는 무료인가요?',
    a: '대부분 무료예요. 운영비는 쇼핑몰 제휴 링크와 광고에서 나와요. 제휴 링크로 사도 내가 내는 가격은 같아요. 지름알림도 보기·알림 모두 무료예요.',
  },
  {
    q: '핫딜이 진짜 싼지는 어떻게 아나요?',
    a: '쇼핑몰 정가가 아니라 같은 상품이 지난 핫딜에서 얼마였는지와 비교해요. 지름알림은 지난 1년 커뮤니티 핫딜가 분포에서 지금 가격이 어디쯤인지, 다나와 최저가·쿠팡 같은 상품 가격은 얼마인지 상품 페이지마다 보여 드려요.',
  },
  {
    q: '핫딜 알림은 어떻게 받나요?',
    a: '키워드를 등록하면 그 단어가 들어간 핫딜이 커뮤니티에 올라올 때 푸시가 와요. 제외 단어와 가격 범위를 정하면 잡알림이 줄어요.',
  },
];

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default async function HotdealSitesGuidePage() {
  const { isJirumAlarmApp } = await checkDevice();
  // 쇼핑몰별 핫딜 모음(/curation/mall-group-{id}) — 이 글이 그 페이지들의 거의 유일한 안쪽 링크다(홈은 서버 구성에 든 몰만).
  const mallGroups = await PromotionService.getMallGroups()
    .then((r) =>
      r.mallGroups.filter((m) => m.isActive).sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)),
    )
    .catch(() => []);

  return (
    <main className="max-w-mobile-max pc:pt-24 mx-auto w-full px-5 pt-14 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(faqLd)} />
      <DealsMobileHeader title="핫딜 사이트·앱 고르는 법" />

      <article className="text-15 space-y-10 leading-relaxed text-gray-800">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">핫딜 사이트·앱 고르는 법</h1>
          <p className="mt-3">
            핫딜은 쇼핑몰보다 커뮤니티 게시판에 먼저 올라오고 몇 시간이면 끝나요. 그래서 커뮤니티를
            돌아다니는 대신 흩어진 글을 한곳에 모아 주는 핫딜 사이트와 앱이 있어요. 종류가 세 갈래라
            무엇을 기대하고 고르는지에 따라 맞는 곳이 달라요.
          </p>
        </header>

        <section>
          <h2 className={cn(text.title, 'mb-3')}>핫딜이 올라오는 곳</h2>
          <p>
            커뮤니티 {COMMUNITY_COUNT}에 하루 {DAILY_COMMUNITY_DEALS} 안팎의 핫딜 글이
            올라와요(지름알림이 모으는 곳 기준, 요일마다 오르내려요). 쇼핑몰이 직접 여는 특가는 따로
            모아요.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {SOURCE_COMMUNITIES.map((c) => (
              <li key={c} className={cn('inline-block', linkChip)}>
                {c}
              </li>
            ))}
          </ul>
          <p className={cn(text.muted, 'mt-3')}>쇼핑몰 특가: {SHOPPING_SOURCES.join(' · ')}</p>
          {mallGroups.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="쇼핑몰별 핫딜 모음">
              {mallGroups.map((m) => (
                <li key={m.id}>
                  <Link
                    href={m.title === '토스' ? '/toss' : `/curation/mall-group-${Math.trunc(m.id)}`}
                    className={cn('inline-block', linkChip)}
                  >
                    {m.title} 핫딜 모음
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section>
          <h2 className={cn(text.title, 'mb-3')}>핫딜 사이트 세 갈래</h2>
          <ol className="space-y-4">
            {KINDS.map((k, i) => (
              <li key={k.name}>
                <h3 className={cn(text.subtitle)}>
                  {i + 1}. {k.name}
                </h3>
                <p className="mt-1">{k.what}</p>
                <p className={cn(text.muted, 'mt-1')}>예: {k.examples}</p>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className={cn(text.title, 'mb-3')}>고를 때 볼 것 다섯 가지</h2>
          <ol className="list-decimal space-y-2 pl-5">
            {CHECKS.map((c) => (
              <li key={c.name}>
                <strong>{c.name}</strong> — {c.text}
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className={cn(text.title, 'mb-3')}>지름알림은 어떤 칸인가요?</h2>
          <p>
            세 번째 갈래예요. 커뮤니티 {COMMUNITY_COUNT}과 {SHOPPING_SOURCES.join('·')} 특가를
            모으고, 상품마다 같은 상품이 지난 1년 커뮤니티 핫딜로 올라온 가격과 비교해 지금 가격이
            어디쯤인지 보여 드려요. 다나와 최저가·쿠팡 같은 상품 가격도 함께 있어요. 키워드 알림엔
            제외 단어와 가격 범위를 걸 수 있고, 웹·앱·카카오톡 오픈채팅에서 같은 핫딜을 받아요.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            <li>
              <Link href="/help#evidence" className={cn('inline-block', linkChip)}>
                가격을 판단하는 법
              </Link>
            </li>
            <li>
              <Link href="/guide/hotdeal-alarm" className={cn('inline-block', linkChip)}>
                핫딜 알림 받는 법
              </Link>
            </li>
            <li>
              <Link href={PAGE.HELP} className={cn('inline-block', linkChip)}>
                지름알림이란 · 자주 묻는 질문
              </Link>
            </li>
            {isJirumAlarmApp ? null : (
              <li>
                <Link href="/app" className={cn('inline-block', linkChip)}>
                  지름알림 앱 받기
                </Link>
              </li>
            )}
          </ul>
        </section>

        <section>
          <h2 className={cn(text.title, 'mb-3')}>자주 묻는 질문</h2>
          <dl className="space-y-4">
            {FAQ.map((f) => (
              <div key={f.q}>
                <dt className="font-semibold text-gray-900">{f.q}</dt>
                <dd className="mt-1">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </article>
    </main>
  );
}
