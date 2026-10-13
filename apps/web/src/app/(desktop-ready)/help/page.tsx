import { Metadata } from 'next';
import Link from 'next/link';

import { METADATA_SERVICE_URL } from '@/shared/config/env';
import { PAGE } from '@/shared/config/page';
import { OKACHAT_LINK } from '@/shared/lib/okachat';
import { ArrowDown } from '@/shared/ui/common/icons';

import DealsMobileHeader from '../deals/[slug]/DealsMobileHeader';

import OpenFaqFromHash from './OpenFaqFromHash';

/**
 * 지름알림이란 · 다른 점 · 쓸 수 있는 기능 · 자주 묻는 질문. 서비스 안(마이페이지 「지원」·홈 「어떻게 쓰나요?」
 * 배너·앱 내정보·데스크톱 푸터)에서 여는 문서이자, 「지름알림」·「핫딜 사이트 추천」·「핫딜 알림 앱」 같은 정보형
 * 질의를 받을 문서다.
 *
 * 왜: 소개는 about-us 서브도메인에 따로 있어 서비스 안에서 거의 안 보이고, 「9개 커뮤니티」처럼 낡았다.
 * 웹 사용자가 실제로 머무는 곳은 상세(30일 7.5만 조회, 2026-10-14 GA4)라, 「무엇이 좋은지·어떻게 쓰는지」는
 * 서비스 안에서 닿는 자리에 둔다. 앱은 같은 페이지를 웹뷰로 연다(약관과 같은 방식 — 정본 하나).
 *
 * 쓰는 법:
 * - 차별점은 「모아 봐서 편하다」보다 「진짜 싼지 근거」를 앞에 둔다 — 사람은 편의가 아니라 싸게 사려고 온다
 *   (마케팅 기각 목록 2026-09-01, 「하루 20~50개, 잡담 없이」 문구가 "너무 노말"로 기각).
 * - 다른 서비스가 못 한다고 쓰지 않는다(뽐뿌 앱에도 키워드 알림이 있다). 우리가 하는 것만 사실로 쓴다.
 * - 제휴가 순위를 안 바꾼다고 쓰지 않는다 — 랭킹엔 판매처 배수가 있다(토스 ×1.5, 2026-10-08).
 * - 질문형 소제목 + 정의형 첫 문장 + FAQPage JSON-LD — 검색·AI 답변이 인용하는 모양.
 * - 앱 웹뷰에서도 열리므로 마이페이지 링크(/mypage/*)는 걸지 않는다(앱은 그 화면이 네이티브 — 웹뷰 안에서
 *   웹 마이페이지가 열리면 로그인 상태가 다를 수 있다). 위치는 글로 안내한다.
 * 숫자(커뮤니티 목록·하루 건수·키워드 20개·제외 단어 10개·하루 3건·21~08시)는 실제 데이터·서버 값이다
 * (2026-10-14 운영 DB 최근 7일: 커뮤니티 13곳 하루 ~940건). 바뀌면 같이 고칠 것.
 */
const PATH = '/help';
const title = '지름알림이란? 핫딜 모아보기·진짜 싼지 근거·키워드 알림 | 자주 묻는 질문';
const description =
  '지름알림은 뽐뿌·에펨코리아·아카라이브 등 커뮤니티 13곳과 쇼핑몰 특가의 핫딜을 한곳에 모아, 지난 핫딜가·다나와·쿠팡 가격과 비교해 진짜 싼지 근거를 붙이고, 원하는 상품이 올라오면 알려주는 무료 핫딜 서비스예요. 다른 핫딜 사이트와 다른 점, 쓸 수 있는 기능, 자주 묻는 질문을 모았어요.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${METADATA_SERVICE_URL}${PATH}` },
  openGraph: {
    title,
    description,
    url: `${METADATA_SERVICE_URL}${PATH}`,
    type: 'article',
    siteName: '지름알림',
    images: [{ url: `${METADATA_SERVICE_URL}/opengraph-image.webp`, width: 1200, height: 630 }],
  },
};

const COMMUNITIES =
  '뽐뿌·에펨코리아·아카라이브·이토랜드·맘이베베·퀘이사존·루리웹·쿨엔조이·어미새·딜바다·다모앙·클리앙';

/** 다른 핫딜 커뮤니티·사이트와 다른 점. 순서 = 사람들이 오는 이유(싸게 사기) 순. */
const DIFFERENCES = [
  {
    title: '「진짜 싼지」 근거를 먼저 보여줘요',
    text: '커뮤니티 핫딜은 올린 사람의 「싸다」에서 시작해요. 지름알림은 같은 상품이 예전에 핫딜로 올라온 가격, 다나와 최저가, 쿠팡의 같은 상품 가격과 비교한 근거를 가격 바로 아래에 붙여요. 근거가 없으면 억지로 싸다고 하지 않아요.',
  },
  {
    title: '커뮤니티 13곳을 한 번에',
    text: `핫딜은 ${COMMUNITIES} 등 커뮤니티마다 따로 올라와요. 커뮤니티 핫딜만 하루 900건 안팎이라(2026년 10월 기준) 한두 곳만 보면 나머지를 놓쳐요. 토스쇼핑·네이버쇼핑·오늘의집 특가도 함께 모아요.`,
  },
  {
    title: '원하는 상품만 골라 알림',
    text: '키워드 하나로 모든 커뮤니티를 지켜봐요. 「콜라」에서 「콜라겐」을 빼는 제외 단어, 원하는 가격 범위까지 정할 수 있어 필요 없는 알림이 줄어요.',
  },
  {
    title: '커뮤니티 반응은 그대로',
    text: '원문 커뮤니티의 추천·댓글 반응과 댓글 요약, 종료 여부를 같이 보여주고 원문으로 바로 이어져요. 커뮤니티를 대신하는 게 아니라 여러 커뮤니티를 한 번에 읽게 해 주는 서비스예요.',
  },
];

/** 쓸 수 있는 기능. 링크는 웹 경로(앱 웹뷰에서도 그대로 열린다). 마이페이지 하위는 글로만. */
const FEATURES: { name: string; text: string; href?: string }[] = [
  { name: '홈', text: '카테고리별로 지금 올라온 핫딜을 봐요.', href: PAGE.HOME },
  { name: '실시간', text: '방금 올라온 핫딜을 시간순으로 봐요.', href: PAGE.TRENDING_LIVE },
  { name: '랭킹', text: '커뮤니티 반응이 좋은 핫딜을 순위로 봐요.', href: PAGE.TRENDING_RANKING },
  {
    name: '최저가 모음',
    text: '인기 상품별 핫딜 최저가와 가격 흐름을 모아 봐요.',
    href: PAGE.DEALS,
  },
  {
    name: '키워드별 핫딜',
    text: '삼다수·기저귀·노트북처럼 검색어별로 최근 핫딜을 모아 봐요.',
    href: PAGE.KEYWORDS,
  },
  {
    name: '상품 상세',
    text: '「왜 핫딜인지」 근거, 같은 상품의 가격 추이, 커뮤니티 반응과 댓글 요약을 한 화면에서 봐요.',
  },
  {
    name: '키워드 알림',
    text: '원하는 상품 핫딜이 올라오면 푸시로 받아요. 마이페이지 → 키워드 알림.',
  },
  {
    name: '관심사 알림',
    text: '키워드 없이도 관심사에서 반응 좋은 딜을 하루 최대 3건 받아요.',
    href: '/themes',
  },
  { name: '찜', text: '마음에 드는 핫딜을 저장해 두고 나중에 봐요.' },
  { name: '커뮤니티', text: '핫딜 정보와 구매 후기를 다른 사람들과 나눠요.', href: PAGE.COMMUNITY },
  { name: '핫딜 카톡방', text: '오픈채팅방에서 좋은 딜을 실시간으로 받아요.', href: OKACHAT_LINK },
];

const STEPS = [
  {
    name: '모아 보기',
    text: '홈·실시간·랭킹에서 여러 커뮤니티에 올라온 핫딜을 한 번에 봐요.',
  },
  {
    name: '진짜 싼지 확인',
    text: '상품을 누르면 가격 바로 아래 「왜 핫딜인지」 근거가 있어요. 아래로 내리면 같은 상품의 가격 추이와 커뮤니티 반응도 볼 수 있어요.',
  },
  {
    name: '원하는 상품 기다리기',
    text: '지금 살 게 없으면 키워드 알림을 걸어 두세요. 그 상품 핫딜이 올라오는 순간 푸시로 알려드려요.',
  },
];

type Faq = { id: string; q: string; a: string; link?: { href: string; label: string } };

const FAQ_GROUPS: { title: string; items: Faq[] }[] = [
  {
    title: '서비스',
    items: [
      {
        id: 'what',
        q: '지름알림은 어떤 서비스인가요?',
        a: '여러 커뮤니티에 흩어져 올라오는 핫딜을 한곳에 모아 보여주는 무료 핫딜 서비스예요. 모아 보기에서 끝나지 않고, 이 가격이 정말 싼지 근거를 붙이고, 원하는 상품이 올라오면 알려드려요.',
      },
      {
        id: 'sources',
        q: '어디에 올라온 핫딜을 모으나요?',
        a: `${COMMUNITIES} 등 커뮤니티 핫딜 게시판을 읽어요. 커뮤니티 핫딜만 하루 900건 안팎이에요(2026년 10월 기준). 토스쇼핑·네이버쇼핑·오늘의집 특가도 따로 모아요.`,
      },
      {
        id: 'one-place',
        q: '핫딜 사이트를 여러 개 볼 필요가 없나요?',
        a: '대부분은 지름알림 한 곳이면 돼요. 다만 원문 커뮤니티 댓글에만 있는 구매 팁(추가 쿠폰 경로·카드 할인 등)도 있으니, 사기 전에 「원문 보기」로 한 번 확인하는 걸 권해요.',
      },
      {
        id: 'free',
        q: '이용료가 있나요? 지름알림은 어떻게 돈을 버나요?',
        a: '보기와 알림 모두 무료예요. 일부 구매 링크는 제휴 링크라 그 링크로 사면 지름알림이 판매처에서 수수료를 받아요. 사는 가격은 똑같아요.',
      },
      {
        id: 'app',
        q: '웹과 앱은 뭐가 다른가요? 앱은 어디서 받나요?',
        a: '같은 계정으로 같은 핫딜을 봐요. 알림은 앱 푸시가 가장 확실하게 와요. 앱은 App Store와 Google Play에서 「지름알림」으로 찾을 수 있어요. 웹은 브라우저 알림을 허용하면 알림을 받을 수 있어요.',
        link: { href: '/app', label: '앱 받기' },
      },
    ],
  },
  {
    title: '가격 근거',
    items: [
      {
        id: 'evidence',
        q: '이 가격이 진짜 싼지 어떻게 알 수 있나요?',
        a: '상품 상세의 가격 바로 아래 「왜 핫딜인지」를 보세요. 같은 상품이 예전에 핫딜로 올라온 가격(1년 최저·보통가), 다나와 최저가, 쿠팡의 같은 상품 가격, 커뮤니티 반응(인기글·「싸다」「샀다」 댓글) 중 가장 확실한 근거 하나를 보여드려요. 근거가 없으면 이 칸을 아예 띄우지 않아요.',
      },
      {
        id: 'chart',
        q: '가격 추이 그래프는 무엇을 보여주나요?',
        a: '같은 상품으로 확인된 지난 핫딜 가격과 쇼핑몰 가격 기록을 날짜순으로 보여줘요. 이름이 비슷해도 같은 상품인지 확인되지 않은 딜은 잇지 않아요. 다만 옵션·구성이 다르면 값이 달라질 수 있어요.',
      },
      {
        id: 'ranking',
        q: '랭킹은 어떻게 정하나요?',
        a: '커뮤니티 반응(추천·댓글·인기글)과 올라온 시간 등 여러 신호를 함께 보고, 한 카테고리가 순위를 독차지하지 않게 섞어요.',
      },
      {
        id: 'ended',
        q: '끝난 딜도 보이나요?',
        a: '원문이 종료로 바뀌면 「종료」로 표시해요. 표시가 늦을 수 있으니 사기 전에 판매처에서 가격과 재고를 꼭 확인하세요.',
      },
    ],
  },
  {
    title: '알림',
    items: [
      {
        id: 'keyword',
        q: '원하는 상품 핫딜만 알림 받을 수 있나요?',
        a: '마이페이지 → 키워드 알림에서 상품 이름을 등록하면 그 단어가 들어간 핫딜이 올라올 때 푸시를 보내드려요. 키워드는 20개까지, 키워드마다 제외할 단어 10개와 가격 범위를 정할 수 있어요.',
        link: { href: '/guide/hotdeal-alarm', label: '핫딜 알림 받는 법 자세히 보기' },
      },
      {
        id: 'no-keyword',
        q: '키워드를 정하지 않아도 알림을 받을 수 있나요?',
        a: '관심사 알림을 켜면 그 관심사에서 반응이 좋은 딜만 하루 최대 3건 보내드려요. 알림 설정의 「지금 뜨는 좋은 딜」도 관심 카테고리에서 반응이 뜨거운 딜을 하루 최대 3번 알려드려요.',
      },
      {
        id: 'night',
        q: '밤에도 알림이 오나요?',
        a: '밤 9시부터 아침 8시 사이 알림은 야간 알림 수신에 동의하지 않으면 아침 8시에 모아서 보내드려요. 마이페이지 → 알림 설정에서 바꿀 수 있어요.',
      },
      {
        id: 'not-coming',
        q: '알림이 안 와요.',
        a: '휴대폰 설정에서 지름알림 앱 알림이 켜져 있는지, 웹이라면 브라우저 알림이 차단되지 않았는지 먼저 확인해 주세요. 키워드의 제외 단어·가격 범위가 너무 좁지 않은지도 봐 주세요.',
        link: { href: '/guide/hotdeal-alarm', label: '알림이 안 올 때 확인할 것' },
      },
    ],
  },
  {
    title: '그 밖에',
    items: [
      {
        id: 'post',
        q: '핫딜을 직접 올릴 수 있나요?',
        a: '네. 지름알림 웹사이트에 로그인한 뒤 「핫딜 등록」에서 올리면 다른 사람들도 볼 수 있어요. 앱에는 아직 등록 화면이 없어요.',
      },
      {
        id: 'kakao',
        q: '핫딜 카톡방도 있나요?',
        a: '있어요. 오픈채팅 「핫딜 전용 카톡방」에서 좋은 딜을 실시간으로 받을 수 있어요.',
        link: { href: OKACHAT_LINK, label: '카톡방 들어가기' },
      },
      {
        id: 'contact',
        q: '문의는 어디로 하나요?',
        a: '마이페이지 → 고객센터에서 채팅으로 문의하거나, jirumalarm@gmail.com 으로 메일을 보내 주세요.',
      },
    ],
  },
];

const ALL_FAQ = FAQ_GROUPS.flatMap((g) => g.items);

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '지름알림은 다른 핫딜 커뮤니티와 무엇이 다른가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: DIFFERENCES.map((d) => `${d.title}: ${d.text}`).join(' '),
      },
    },
    ...ALL_FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  ],
};

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { name: '지름알림', item: METADATA_SERVICE_URL },
    { name: '지름알림이란 · 자주 묻는 질문', item: `${METADATA_SERVICE_URL}${PATH}` },
  ].map((it, i) => ({ '@type': 'ListItem', position: i + 1, ...it })),
};

const isExternal = (href: string) => href.startsWith('http');

export default function HelpPage() {
  return (
    <main className="max-w-mobile-max pc:pt-24 mx-auto w-full px-5 pt-14 pb-24">
      {[faqLd, breadcrumbLd].map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}
      <DealsMobileHeader title="지름알림 사용법" />
      <OpenFaqFromHash />

      <article className="text-15 space-y-12 leading-relaxed text-gray-800">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">지름알림이란?</h1>
          <p className="mt-3">
            지름알림은 커뮤니티 13곳과 쇼핑몰 특가의 핫딜을 한곳에 모아,{' '}
            <strong>지난 핫딜가·다나와·쿠팡 가격과 비교해 진짜 싼지 근거</strong>를 붙여 주고,
            원하는 상품이 올라오면 알려주는 무료 핫딜 서비스예요.
          </p>
        </header>

        <section aria-labelledby="help-diff">
          <h2 id="help-diff" className="mb-3 text-lg font-semibold text-gray-900">
            다른 핫딜 커뮤니티와 무엇이 다른가요?
          </h2>
          <ul className="pc:grid pc:grid-cols-2 pc:gap-3 pc:space-y-0 space-y-3">
            {DIFFERENCES.map((d) => (
              <li key={d.title} className="rounded-xl bg-gray-50 px-4 py-3">
                <h3 className="font-semibold text-gray-900">{d.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{d.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="help-steps">
          <h2 id="help-steps" className="mb-3 text-lg font-semibold text-gray-900">
            이렇게 쓰세요
          </h2>
          <ol className="space-y-3">
            {STEPS.map((s, i) => (
              <li key={s.name} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white"
                >
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{s.name}</p>
                  <p className="mt-0.5 text-sm text-gray-600">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="help-features">
          <h2 id="help-features" className="mb-3 text-lg font-semibold text-gray-900">
            지름알림에서 쓸 수 있는 기능
          </h2>
          <dl className="divide-y divide-gray-100 border-y border-gray-100">
            {FEATURES.map((f) => (
              <div key={f.name} className="flex gap-4 py-3 text-sm">
                <dt className="w-24 shrink-0 font-semibold text-gray-900">
                  {f.href ? (
                    <Link
                      href={f.href}
                      {...(isExternal(f.href) ? { target: '_blank', rel: 'noopener' } : {})}
                      className="underline underline-offset-2"
                    >
                      {f.name}
                    </Link>
                  ) : (
                    f.name
                  )}
                </dt>
                <dd className="text-gray-600">{f.text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="help-faq">
          <h2 id="help-faq" className="mb-1 text-lg font-semibold text-gray-900">
            자주 묻는 질문
          </h2>
          {FAQ_GROUPS.map((group) => (
            <div key={group.title} className="mt-5">
              <h3 className="mb-1 text-sm font-medium text-gray-500">{group.title}</h3>
              <div className="divide-y divide-gray-100 border-y border-gray-100">
                {group.items.map((f) => (
                  // 접힌 답도 HTML 에 있다(details) — 크롤러·AI 가 본문으로 읽는다.
                  <details key={f.id} id={f.id} className="group scroll-mt-16 py-1">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 font-medium text-gray-900 [&::-webkit-details-marker]:hidden">
                      <span>{f.q}</span>
                      <ArrowDown
                        aria-hidden
                        width={18}
                        height={18}
                        color="var(--color-gray-400)"
                        className="shrink-0 transition-transform group-open:rotate-180"
                      />
                    </summary>
                    <div className="pb-4 text-sm leading-relaxed text-gray-700">
                      <p>{f.a}</p>
                      {f.link ? (
                        <Link
                          href={f.link.href}
                          {...(isExternal(f.link.href)
                            ? { target: '_blank', rel: 'noopener' }
                            : {})}
                          className="mt-2 inline-block text-gray-500 underline underline-offset-2"
                        >
                          {f.link.label}
                        </Link>
                      ) : null}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </section>

        <Link
          href={PAGE.HOME}
          className="inline-flex rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
        >
          지금 올라온 핫딜 보기
        </Link>
      </article>
    </main>
  );
}
