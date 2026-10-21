import { infoBox, linkChip } from '@jirum/design-system/recipes';
import {
  COMMUNITY_COUNT,
  DAILY_COMMUNITY_DEALS,
  SERVICE_STATS,
  SOURCE_COMMUNITIES,
} from '@jirum/domain/service-facts';
import { Metadata } from 'next';
import Link from 'next/link';

import { checkDevice } from '@/shared/actions/agent';
import { METADATA_SERVICE_URL } from '@/shared/config/env';
import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';
import { OKACHAT_LINK } from '@/shared/lib/okachat';
import { ArrowDown, ArrowRight } from '@/shared/ui/common/icons';
import { IconLogo } from '@/shared/ui/common/icons/Illust';

import DealsMobileHeader from '../deals/[slug]/DealsMobileHeader';

import HelpConcepts from './HelpConcepts';
import HelpIcon, { type HelpIconName } from './HelpIcons';
import HelpToc, { type TocItem } from './HelpToc';
import OpenFaqFromHash from './OpenFaqFromHash';

/**
 * 지름알림이란 · 다른 점 · 쓸 수 있는 기능 · 자주 묻는 질문. 서비스 안(마이페이지 「지원」·홈 「어떻게 쓰나요?」
 * 배너·앱 내정보·데스크톱 푸터)에서 여는 문서이자, 「지름알림」·「핫딜 사이트 추천」·「핫딜 알림 앱」 같은 정보형
 * 질의를 받을 문서다.
 *
 * 왜: 소개는 about-us 서브도메인에 따로 있어 서비스 안에서 거의 안 보이고, 「9개 커뮤니티」처럼 낡았다.
 * 웹 사용자가 실제로 머무는 곳은 상세(조회 대부분, GA4)라, 「무엇이 좋은지·어떻게 쓰는지」는
 * 서비스 안에서 닿는 자리에 둔다. 앱은 같은 페이지를 웹뷰로 연다(약관과 같은 방식 — 정본 하나).
 *
 * 쓰는 법:
 * - 차별점은 「모아 봐서 편하다」보다 「진짜 싼지 근거」를 앞에 둔다 — 사람은 편의가 아니라 싸게 사려고 온다
 *   (마케팅 기각 목록 2026-09-01, 「하루 20~50개, 잡담 없이」 문구가 "너무 노말"로 기각).
 * - 다른 서비스가 못 한다고 쓰지 않는다(뽐뿌 앱에도 키워드 알림이 있다). 우리가 하는 것만 사실로 쓴다.
 * - 제휴가 순위를 안 바꾼다고 쓰지 않는다 — 랭킹엔 판매처 배수가 있다(토스 ×1.5, 2026-10-08).
 * - 질문형 소제목 + 정의형 첫 문장 + FAQPage JSON-LD — 검색·AI 답변이 인용하는 모양.
 * - 앱 웹뷰에서도 열리므로 본문엔 마이페이지 링크(/mypage/*)를 걸지 않는다(앱은 그 화면이 네이티브 — 웹뷰 안에서
 *   웹 마이페이지가 열리면 로그인 상태가 다를 수 있다). 위치는 글로 안내한다. 맨 아래 「키워드 알림 걸기」만
 *   웹일 때 링크로 띄우고, 앱(isJirumAlarmApp)에선 「내정보 → 키워드 알림」 글로 바꾼다.
 *
 * 모양(2026-10-14 개편 — "디자인이 구리다"): 글만 이어지던 문서를 훑어 읽는 모양으로 바꿨다.
 * 첫 화면에 정의 한 문장 + 숫자 3개 + 상세 근거 칸 예시(말보다 실물) → 바로가기 칩 → 아이콘 카드 → 단계 → 기능 타일 → 묶음별
 * 질문 → 「찾는 답이 없나요?」 → 행동 유도 띠. 한국어는 break-keep(낱말 중간 줄바꿈 금지).
 * PC(2026-10-14 2차 — "PC 가 어색하고 딱딱하다"): 600px 모바일 기둥이 넓은 화면 가운데 떠 있던 것을 1024px 로 넓혀
 * 첫 화면은 2단(왼쪽 정의·숫자·행동 버튼 / 오른쪽 근거 칸 예시), 본문은 왼쪽 고정 목차(HelpToc) + 본문 폭 ~700px.
 * 딱딱함은 회색 테두리 상자 나열이 원인이라 테두리를 빼고 면(gray-50)·구역별 색 아이콘·마스코트·작은 색 eyebrow 로 바꿨다.
 * 질문 묶음 상자는 overflow-clip — overflow-hidden 은 스크롤 컨테이너가 돼 /help#evidence 의 scroll-margin 이 무시되고
 * 질문 제목이 헤더 밑으로 숨었다.
 * 숫자(키워드 20개·제외 단어 10개·하루 3건·21~08시)는 서버 값이다. 커뮤니티 목록·곳 수·하루 건수는 소개 페이지와 같이 쓰는
 * 정본 @jirum/domain/service-facts 에서 온다 — 바뀌면 거기를 고친다.
 */
const PATH = '/help';
// 검색 결과에서 잘리지 않는 길이 — 제목 ~30자, 설명 ~100자(모바일 검색 결과 기준). 예전 제목 43자·설명 170자는 뒤가 잘렸다.
const title = '지름알림이란? 핫딜 알림 사용법·자주 묻는 질문';
const description = `뽐뿌·에펨코리아 등 커뮤니티 ${COMMUNITY_COUNT}의 핫딜을 한곳에 모아 진짜 싼지 근거를 붙이고, 원하는 상품이 올라오면 알려주는 무료 서비스예요. 다른 점·사용법·자주 묻는 질문을 모았어요.`;

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

const COMMUNITIES = SOURCE_COMMUNITIES.join('·');

/** 다른 핫딜 커뮤니티·사이트와 다른 점. 순서 = 사람들이 오는 이유(싸게 사기) 순. tone = 아이콘 칸 색(싸다=빨강 관례). */
type Tone = 'error' | 'secondary' | 'primary' | 'success';
const TONE: Record<Tone, string> = {
  error: 'bg-error-50 text-error-600',
  secondary: 'bg-secondary-50 text-secondary-600',
  primary: 'bg-primary-100 text-primary-800',
  success: 'bg-success-50 text-success-700',
};

const DIFFERENCES: {
  icon: HelpIconName;
  tone: Tone;
  title: string;
  text: string;
  tags?: string[];
}[] = [
  {
    icon: 'tag',
    tone: 'error',
    title: '「진짜 싼지」 근거를 먼저 보여드려요',
    text: '커뮤니티 핫딜은 올린 사람의 「싸다」에서 시작해요. 지름알림은 같은 상품이 예전에 핫딜로 올라온 가격, 다나와 최저가, 쿠팡의 같은 상품 가격과 비교한 근거를 가격 바로 아래에 붙여요. 근거가 없으면 억지로 싸다고 하지 않아요.',
  },
  {
    icon: 'layers',
    tone: 'secondary',
    title: `커뮤니티 ${COMMUNITY_COUNT}을 한눈에`,
    text: `핫딜은 커뮤니티마다 따로 올라와요. 커뮤니티 핫딜만 하루 ${DAILY_COMMUNITY_DEALS} 안팎이라(2026년 10월 기준) 한두 곳만 보면 나머지를 놓쳐요. 토스쇼핑·네이버쇼핑·오늘의집 특가도 함께 모아요.`,
    tags: COMMUNITIES.split('·'),
  },
  {
    icon: 'bell',
    tone: 'primary',
    title: '원하는 상품만 골라서 알려드려요',
    text: '키워드 하나로 모든 커뮤니티를 지켜봐요. 「콜라」에서 「콜라겐」을 빼는 제외 단어, 원하는 가격 범위까지 정할 수 있어 필요 없는 알림이 줄어요.',
  },
  {
    icon: 'chat',
    tone: 'success',
    title: '커뮤니티 반응도 그대로',
    text: '원문 커뮤니티의 추천·댓글 반응과 댓글 요약, 종료 여부를 같이 보여주고 원문으로 바로 이어져요. 커뮤니티를 대신하는 게 아니라 여러 커뮤니티를 한 번에 읽게 해 주는 서비스예요.',
  },
];

/**
 * 쓸 수 있는 기능 — 하는 일(둘러보기·알림·함께) 묶음. 링크는 웹 경로(앱 웹뷰에서도 그대로 열린다). 마이페이지 하위는 글로만.
 */
type Feature = { icon: HelpIconName; name: string; text: string; href?: string };

const FEATURE_GROUPS: { title: string; tone: Tone; items: Feature[] }[] = [
  {
    title: '둘러보기',
    tone: 'secondary',
    items: [
      { icon: 'home', name: '홈', text: '카테고리별로 지금 올라온 핫딜', href: PAGE.HOME },
      {
        icon: 'zap',
        name: '실시간',
        text: '방금 올라온 핫딜을 시간순으로',
        href: PAGE.TRENDING_LIVE,
      },
      {
        icon: 'trophy',
        name: '랭킹',
        text: '커뮤니티 반응이 좋은 핫딜 순위',
        href: PAGE.TRENDING_RANKING,
      },
      {
        icon: 'hash',
        name: '키워드별 핫딜',
        text: '삼다수·기저귀·노트북처럼 검색어별 최근 핫딜',
        href: PAGE.KEYWORDS,
      },
      {
        icon: 'chart',
        name: '최저가 모음',
        text: '상품별 핫딜 최저가와 가격 흐름 — 키워드 안의 상품별 보기',
        href: PAGE.DEALS,
      },
      {
        icon: 'doc',
        name: '상품 상세',
        text: '「왜 핫딜인지」 근거·가격 추이·커뮤니티 반응과 댓글 요약',
      },
    ],
  },
  {
    title: '알림 받기',
    tone: 'primary',
    items: [
      {
        icon: 'bell',
        name: '키워드 알림',
        text: '원하는 상품 핫딜이 올라오면 푸시로 · 마이페이지 → 키워드 알림',
      },
      {
        icon: 'sparkle',
        name: '관심사 알림',
        text: '키워드 없이도 관심사의 반응 좋은 딜을 하루 최대 3건',
        href: '/themes',
      },
      {
        icon: 'chat',
        name: '핫딜 카톡방',
        text: '오픈채팅방에서 좋은 딜을 실시간으로',
        href: OKACHAT_LINK,
      },
    ],
  },
  {
    title: '함께 쓰기',
    tone: 'error',
    items: [
      { icon: 'heart', name: '찜', text: '마음에 드는 핫딜을 저장해 두고 나중에' },
      {
        icon: 'users',
        name: '커뮤니티',
        text: '핫딜 정보와 구매 후기 나누기',
        href: PAGE.COMMUNITY,
      },
    ],
  },
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

const FAQ_GROUPS: { id: string; title: string; items: Faq[] }[] = [
  {
    id: 'faq-service',
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
        a: `${COMMUNITIES} 등 커뮤니티 핫딜 게시판을 읽어요. 커뮤니티 핫딜만 하루 ${DAILY_COMMUNITY_DEALS} 안팎이에요(2026년 10월 기준). 토스쇼핑·네이버쇼핑·오늘의집 특가도 따로 모아요.`,
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
    id: 'faq-price',
    title: '가격 근거',
    items: [
      {
        // #evidence 는 핵심 개념 1(가격 자 그림)이 받는다 — 상세 「가격을 판단하는 법」 링크가 그림으로 떨어지게.
        id: 'evidence-faq',
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
    id: 'faq-alarm',
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
    id: 'faq-etc',
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
        text: DIFFERENCES.map(
          (d) => `${d.title}: ${d.text}${d.tags ? ` 모으는 곳: ${COMMUNITIES} 등.` : ''}`,
        ).join(' '),
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

/** 앱엔 「마이페이지」가 없다 — 같은 화면을 「내정보」라 부른다. 본문 글의 위치 안내를 앱 이름으로 바꾼다. */
const placeName = (text: string, isApp: boolean) =>
  isApp ? text.replaceAll('마이페이지 →', '내정보 →') : text;
const externalProps = (href: string) =>
  isExternal(href) ? { target: '_blank', rel: 'noopener' } : {};

/**
 * 페이지 안 바로가기. 긴 문서에서 원하는 곳으로 건너뛰게 하고, 검색 결과의 「바로가기」 링크 재료도 된다.
 * 모바일은 본문 위 칩, PC 는 왼쪽 고정 목차(HelpToc — 지금 읽는 곳 표시).
 */
const TOC: TocItem[] = [
  {
    id: 'concepts',
    label: '핵심 개념',
    children: [
      { id: 'evidence', label: '진짜 싼지' },
      { id: 'gather', label: '한곳에 모아' },
      { id: 'alarm', label: '골라서 알림' },
    ],
  },
  { id: 'how-to', label: '사용법' },
  { id: 'features', label: '기능' },
  {
    id: 'faq',
    label: '자주 묻는 질문',
    children: FAQ_GROUPS.map((g) => ({ id: g.id, label: g.title })),
  },
];

/** 구역 제목. eyebrow(작은 색 글씨)는 목차 이름과 같아 「지금 어디인지」를 알려 주고, 문서가 딱딱한 제목 나열로 안 보이게 한다. */
function SectionHeading({
  id,
  eyebrow,
  title,
  sub,
}: {
  id: string;
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="pc:mb-6 mb-5">
      <p className="text-primary-800 text-sm font-semibold">{eyebrow}</p>
      <h2 id={`${id}-title`} className="pc:text-2xl mt-1 text-xl font-bold text-gray-900">
        {title}
      </h2>
      {sub ? <p className="mt-1.5 text-sm text-gray-500">{sub}</p> : null}
    </div>
  );
}

/**
 * 상세의 「왜 핫딜인지」 칸을 본뜬 예시 — 말로 설명하는 것보다 실제 모양을 한 번 보여주는 게 빠르다.
 * 문구 형식은 서버(product-price-verdict.logic cheapCopy)와 같고, 숫자는 예시라 「예시」를 붙인다.
 */
function EvidenceExample() {
  return (
    <figure data-nosnippet>
      <div className="shadow-card rounded-2xl bg-white p-4">
        <p className="text-sm text-gray-500">제주 삼다수 2L 24병</p>
        <p className="mt-0.5 text-xl font-bold text-gray-900">
          <span className="text-error-600 mr-1.5">19%</span>12,900원
        </p>
        <div className={cn('mt-3 flex gap-2.5 px-4 py-3', infoBox)}>
          <span className="bg-error-50 text-error-600 flex size-7 shrink-0 items-center justify-center rounded-full">
            <HelpIcon name="tag" className="size-4" />
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="text-sm font-semibold text-gray-900">
              보통가보다 <b className="text-error-600 font-bold">3,100원</b> 싸요 (19%)
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              좋은 딜 · 지난 1년 핫딜 14건 중 85%보다 싸요
            </p>
          </div>
        </div>
      </div>
      <figcaption className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-gray-500">
        <span className="rounded bg-white px-1.5 py-0.5 font-semibold text-gray-600">예시</span>
        상품을 누르면 가격 바로 아래에 이렇게 보여요
      </figcaption>
    </figure>
  );
}

/** 웹에서만 — 앱 웹뷰에선 마이페이지 링크가 엉뚱한 곳으로 가서 글로 안내한다(파일 머리 주석). */
function CtaButtons({ track, onDark }: { track: string; onDark?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={PAGE.MYPAGE_KEYWORD}
        data-track={`${track}-keyword`}
        className="bg-primary-500 active:bg-primary-300 hover:bg-primary-400 text-fixed-900 inline-flex items-center gap-1.5 rounded-xl px-4 py-3 text-sm font-semibold"
      >
        <HelpIcon name="bell" className="size-4" />
        키워드 알림 걸기
      </Link>
      <Link
        href={PAGE.HOME}
        data-track={`${track}-home`}
        className={cn(
          'rounded-xl px-4 py-3 text-sm font-semibold',
          onDark
            ? 'border-fixed-600 text-fixed-white hover:bg-fixed-white/10 border'
            : 'bg-white text-gray-900 hover:bg-gray-50',
        )}
      >
        지금 올라온 핫딜 보기
      </Link>
    </div>
  );
}

export default async function HelpPage() {
  // 앱은 이 페이지를 웹뷰로 연다 — 웹 마이페이지·앱 받기 버튼은 앱 안에선 엉뚱한 곳으로 간다.
  const { isJirumAlarmApp } = await checkDevice();

  return (
    <main className="max-w-mobile-max pc:max-w-5xl pc:px-10 pc:pt-20 mx-auto w-full px-5 pt-14 pb-24">
      {[faqLd, breadcrumbLd].map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}
      <DealsMobileHeader title="지름알림 사용법" />
      <OpenFaqFromHash />

      {/* break-keep: 한국어를 낱말 중간에서 자르지 않는다(「서 비스예요」처럼 끊겨 읽기 거슬렸다). */}
      <article className="text-15 leading-relaxed break-keep text-gray-800">
        {/* 첫 화면: 연한 브랜드색 판 위에 마스코트·정의·숫자, 오른쪽(PC)·아래(모바일)에 실제 근거 칸 예시. */}
        <header className="bg-primary-50 pc:mt-6 pc:grid pc:grid-cols-[1fr_380px] pc:items-center pc:gap-12 pc:rounded-3xl pc:p-12 pc:mx-0 -mx-5 mt-3 px-5 pt-7 pb-8">
          <div>
            <IconLogo width={44} height={44} className="pc:size-14" />
            <h1 className="pc:mt-5 mt-4 font-bold text-gray-900">
              <span className="text-primary-800 block text-sm font-semibold">지름알림이란?</span>
              <span className="text-28 pc:text-4xl mt-1.5 block leading-tight">
                흩어진 핫딜을 모아
                <br />
                진짜 싼지 알려드려요
              </span>
            </h1>
            <p className="pc:text-lg mt-4 text-base leading-relaxed text-gray-700">
              지름알림은 커뮤니티 {COMMUNITY_COUNT}과 쇼핑몰 특가의 핫딜을 한곳에 모아,{' '}
              <strong className="font-semibold text-gray-900">
                지난 핫딜가·다나와·쿠팡 가격과 비교해 진짜 싼지 근거
              </strong>
              를 붙여 주고, 원하는 상품이 올라오면 알려주는 무료 핫딜 서비스예요.
            </p>

            <ul className="pc:max-w-md mt-6 grid grid-cols-3 gap-2">
              {SERVICE_STATS.map((s) => (
                <li key={s.label} className="rounded-2xl bg-white px-2 py-3 text-center">
                  <strong className="pc:text-xl block text-lg font-bold text-gray-900">
                    {s.value}
                  </strong>
                  <span className="mt-0.5 block text-xs leading-snug text-gray-500">{s.label}</span>
                </li>
              ))}
            </ul>

            {isJirumAlarmApp ? null : (
              <div className="pc:block mt-7 hidden">
                <CtaButtons track="help-hero-cta" />
              </div>
            )}
          </div>

          <div className="pc:mt-0 mt-7">
            <EvidenceExample />
          </div>
        </header>

        <nav aria-label="이 페이지에서" className="pc:hidden mt-6 flex flex-wrap gap-2">
          {TOC.map((t) => (
            <a key={t.id} href={`#${t.id}`} className={linkChip}>
              {t.label}
            </a>
          ))}
        </nav>

        {/* PC: 왼쪽 고정 목차 + 본문(읽기 좋은 폭 ~700px). 모바일: 본문만. */}
        <div className="pc:mt-16 pc:grid pc:grid-cols-[168px_1fr] pc:gap-14 mt-12">
          <aside className="pc:block hidden">
            <div className="sticky top-24">
              <HelpToc items={TOC} />
            </div>
          </aside>

          <div className="pc:space-y-20 min-w-0 space-y-14">
            {/* 핵심 개념(2026-10-19): 차별점 카드 4장(글)을 그림 셋으로 — 가격 자·모으는 흐름·알림 거름망. DIFFERENCES 는 JSON-LD 답으로 남는다. */}
            <section id="concepts" aria-labelledby="concepts-title" className="scroll-mt-20">
              <SectionHeading
                id="concepts"
                eyebrow="핵심 개념"
                title="지름알림은 이렇게 일해요"
                sub="싸게 사는 데 꼭 필요한 세 가지를 그림으로 보여드릴게요."
              />
              <HelpConcepts communityCount={SOURCE_COMMUNITIES.length} isApp={isJirumAlarmApp} />
            </section>

            <section id="how-to" aria-labelledby="how-to-title" className="scroll-mt-20">
              <SectionHeading
                id="how-to"
                eyebrow="사용법"
                title="이렇게 쓰면 돼요"
                sub="세 단계면 충분해요."
              />
              <ol className="pc:grid pc:grid-cols-3 pc:gap-3">
                {STEPS.map((s, i) => (
                  <li
                    key={s.name}
                    className="pc:block pc:rounded-2xl pc:bg-gray-50 pc:p-5 relative flex gap-4 pb-6 last:pb-0"
                  >
                    {/* 모바일 단계 사이 세로선 — 마지막 단계엔 없다. PC 는 카드 3장이 나란히라 필요 없다. */}
                    {i < STEPS.length - 1 ? (
                      <span
                        aria-hidden
                        className="pc:hidden absolute top-9 bottom-1 left-[15px] w-0.5 bg-gray-100"
                      />
                    ) : null}
                    <span
                      aria-hidden
                      className="bg-primary-500 text-fixed-900 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    >
                      {i + 1}
                    </span>
                    <div className="pc:pt-0 pc:mt-4 pt-1">
                      <h3 className="text-base font-bold text-gray-900">{s.name}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section id="features" aria-labelledby="features-title" className="scroll-mt-20">
              <SectionHeading
                id="features"
                eyebrow="기능"
                title="지름알림에서 쓸 수 있는 기능"
                sub="화살표가 있는 건 눌러서 바로 가 볼 수 있어요."
              />
              <div className="space-y-7">
                {/* 앱: 핫딜 최저가(/deals)는 앱에서 열지 않는다(tab-routing — 탭 루트로 흘린다) → 카드도 뺀다. */}
                {FEATURE_GROUPS.map((g) => (
                  <div key={g.title}>
                    <h3 className="mb-2.5 text-sm font-semibold text-gray-500">{g.title}</h3>
                    <ul className="pc:grid-cols-3 grid grid-cols-2 gap-2">
                      {g.items
                        .filter((f) => !(isJirumAlarmApp && f.href === PAGE.DEALS))
                        .map((f) => {
                          const body = (
                            <>
                              <span className="flex items-center justify-between">
                                <span
                                  className={cn(
                                    'flex size-9 items-center justify-center rounded-lg',
                                    TONE[g.tone],
                                  )}
                                >
                                  <HelpIcon name={f.icon} className="size-[18px]" />
                                </span>
                                {f.href ? (
                                  <ArrowRight
                                    width={16}
                                    height={16}
                                    color="var(--color-gray-400)"
                                    aria-hidden
                                    className="transition-transform group-hover:translate-x-0.5"
                                  />
                                ) : null}
                              </span>
                              <span className="mt-3 block text-sm font-semibold text-gray-900">
                                {f.name}
                              </span>
                              <span className="mt-0.5 block text-xs leading-snug text-gray-500">
                                {placeName(f.text, isJirumAlarmApp)}
                              </span>
                            </>
                          );
                          const box = 'block h-full rounded-2xl bg-gray-50 p-4';
                          return (
                            <li key={f.name}>
                              {f.href && isJirumAlarmApp ? (
                                // 앱: next/link 는 웹뷰 안 SPA 이동이라 앱이 못 가로채 웹 홈·랭킹이 웹뷰 안에 떴다.
                                // 문서 이동(<a>)이면 앱이 링크를 받아 네이티브 화면(홈·발견·커뮤니티·테마)으로 연다.
                                <a href={f.href} className={cn(box, 'group active:bg-gray-100')}>
                                  {body}
                                </a>
                              ) : f.href ? (
                                <Link
                                  href={f.href}
                                  {...externalProps(f.href)}
                                  className={cn(
                                    box,
                                    'group transition-colors hover:bg-gray-100 active:bg-gray-100',
                                  )}
                                >
                                  {body}
                                </Link>
                              ) : (
                                <div className={box}>{body}</div>
                              )}
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20">
              <SectionHeading
                id="faq"
                eyebrow="자주 묻는 질문"
                title="궁금한 게 있으신가요?"
                sub="질문을 누르면 답이 펼쳐져요."
              />
              <nav aria-label="질문 분류" className="pc:hidden -mt-1 mb-5 flex flex-wrap gap-2">
                {FAQ_GROUPS.map((g) => (
                  <a key={g.id} href={`#${g.id}`} className={linkChip}>
                    {g.title}
                  </a>
                ))}
              </nav>
              <div className="space-y-7">
                {FAQ_GROUPS.map((group) => (
                  <div key={group.id} id={group.id} className="scroll-mt-20">
                    <h3 className="mb-2.5 text-sm font-semibold text-gray-500">{group.title}</h3>
                    <div className="divide-y divide-gray-100 overflow-clip rounded-2xl bg-gray-50">
                      {group.items.map((f) => (
                        // 접힌 답도 HTML 에 있다(details) — 크롤러·AI 가 본문으로 읽는다.
                        <details key={f.id} id={f.id} className="group scroll-mt-20">
                          <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3.5 font-medium text-gray-900 group-open:font-semibold hover:bg-gray-100 focus-visible:bg-gray-100 [&::-webkit-details-marker]:hidden">
                            <span aria-hidden className="text-primary-800 shrink-0 font-bold">
                              Q
                            </span>
                            <span className="flex-1">{f.q}</span>
                            <ArrowDown
                              aria-hidden
                              width={18}
                              height={18}
                              color="var(--color-gray-400)"
                              className="shrink-0 transition-transform group-open:rotate-180"
                            />
                          </summary>
                          <div className="pr-4 pb-4 pl-[42px] text-sm leading-relaxed text-gray-700">
                            <p>{placeName(f.a, isJirumAlarmApp)}</p>
                            {/* 앱 안에서 「앱 받기」는 엉뚱하다. */}
                            {f.link && !(isJirumAlarmApp && f.link.href === '/app') ? (
                              <Link
                                href={f.link.href}
                                {...externalProps(f.link.href)}
                                className="text-secondary-600 mt-2 inline-flex items-center gap-0.5 font-medium hover:underline"
                              >
                                {f.link.label} ›
                              </Link>
                            ) : null}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex items-center gap-3 rounded-2xl border border-gray-100 p-4">
                <span className="bg-secondary-50 text-secondary-600 flex size-10 shrink-0 items-center justify-center rounded-full">
                  <HelpIcon name="mail" className="size-5" />
                </span>
                <div className="min-w-0 text-sm">
                  <p className="font-semibold text-gray-900">찾는 답이 없나요?</p>
                  <p className="mt-0.5 text-gray-600">
                    {isJirumAlarmApp ? '내정보 → 고객센터' : '마이페이지 → 고객센터'}에서 채팅으로
                    묻거나{' '}
                    <a
                      href="mailto:jirumalarm@gmail.com"
                      className="text-secondary-600 font-medium hover:underline"
                    >
                      메일
                    </a>
                    을 보내 주세요.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <section
          aria-label="시작하기"
          className="bg-fixed-900 pc:mt-24 pc:flex pc:items-center pc:justify-between pc:gap-8 pc:px-10 pc:py-9 mt-14 rounded-3xl px-5 py-7 dark:bg-gray-50"
        >
          <div className="flex items-start gap-3.5">
            <IconLogo width={40} height={40} className="pc:block hidden shrink-0" />
            <div>
              <p className="text-fixed-white pc:text-2xl text-xl leading-snug font-bold">
                원하는 상품,
                <br className="pc:hidden" /> 올라오면 바로 알려드릴게요
              </p>
              <p className="text-fixed-300 mt-2 text-sm">
                키워드 하나만 걸어 두면 커뮤니티 {COMMUNITY_COUNT}을 대신 지켜봐요.
              </p>
            </div>
          </div>
          {isJirumAlarmApp ? (
            <p className="text-primary-500 pc:mt-0 mt-4 shrink-0 text-sm font-semibold">
              내정보 → 키워드 알림에서 바로 걸 수 있어요
            </p>
          ) : (
            <div className="pc:mt-0 mt-5 shrink-0">
              <CtaButtons track="help-cta" onDark />
            </div>
          )}
        </section>
      </article>
    </main>
  );
}
