import { linkChip } from '@jirum/design-system/recipes';
import { Metadata } from 'next';
import Link from 'next/link';

import { LANDING_URL, METADATA_SERVICE_URL } from '@/shared/config/env';
import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';

import { KEYWORD_HUBS, keywordHubPath } from '@/entities/keyword-hub/lib/keyword-hub';

import DealsMobileHeader from '../../deals/[slug]/DealsMobileHeader';

/**
 * "핫딜 알림 받는 법" 안내. 네이버 자동완성에 "쿠팡 핫딜 알림·네이버 핫딜 알림 받는 법"이 뜨고
 * 그 질의엔 AI 브리핑이 붙는다(2026-10-01 실측) — 정보형 질의를 받을 문서가 우리에겐 없었다.
 * 숫자(키워드 20개·제외 단어 10개·하루 3건·21~08시)는 실제 서버·화면 값이다. 바뀌면 같이 고칠 것.
 */
const PATH = '/guide/hotdeal-alarm';
const title = '핫딜 알림 받는 법 — 원하는 상품 핫딜이 올라오면 바로 받기 | 지름알림';
const description =
  '지름알림 키워드 알림으로 뽐뿌·에펨코리아·루리웹 등 커뮤니티에 원하는 상품 핫딜이 올라오는 순간 푸시를 받는 방법. 키워드 등록, 제외 단어·가격 범위 조건, 관심사 알림, 알림이 안 올 때 확인할 것까지 정리했어요.';

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
};

const STEPS = [
  { name: '로그인', text: '지름알림 웹이나 앱에서 로그인해요. 등록한 키워드는 계정에 저장돼요.' },
  {
    name: '키워드 등록',
    text: '마이페이지 → 키워드 알림에서 받고 싶은 상품 이름을 등록해요(예: 삼다수, 기저귀, 에어팟). 키워드는 최대 20개까지예요.',
  },
  {
    name: '알림 조건 설정(선택)',
    text: '키워드마다 "알림 조건"을 열어 제외할 단어와 가격 범위를 정할 수 있어요. 예를 들어 콜라에 "콜라겐"을 제외하면 콜라겐 딜은 안 와요.',
  },
  {
    name: '알림 허용',
    text: '앱은 알림 권한을, 웹은 브라우저 알림 권한을 허용해야 푸시가 와요. 키워드 화면 위에 푸시가 안 오는 상태면 안내가 떠요.',
  },
];

const howToLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: '지름알림으로 핫딜 알림 받는 법',
  description,
  step: STEPS.map((s, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    name: s.name,
    text: s.text,
  })),
};

const POPULAR = KEYWORD_HUBS.slice(0, 12);

export default function HotdealAlarmGuidePage() {
  return (
    <main className="max-w-mobile-max pc:pt-24 mx-auto w-full px-5 pt-14 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
      />
      <DealsMobileHeader title="핫딜 알림 받는 법" />

      <article className="text-15 space-y-10 leading-relaxed text-gray-800">
        <header>
          <h1 className="text-2xl font-bold text-black">핫딜 알림 받는 법</h1>
          <p className="mt-3">
            지름알림 키워드 알림은 커뮤니티(뽐뿌·에펨코리아·루리웹·퀘이사존·아카라이브 등)에 등록한
            키워드가 들어간 핫딜이 올라오면 바로 푸시로 알려주는 기능이에요. 쿠팡·네이버·알리 같은
            쇼핑몰 딜도 커뮤니티에 올라오면 제목 기준으로 똑같이 알려드려요.
          </p>
        </header>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">키워드 알림 설정하는 법</h2>
          <ol className="list-decimal space-y-2 pl-5">
            {STEPS.map((s) => (
              <li key={s.name}>
                <strong>{s.name}</strong> — {s.text}
              </li>
            ))}
          </ol>
          <Link
            href={PAGE.MYPAGE_KEYWORD}
            rel="nofollow"
            className="mt-4 inline-flex rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
          >
            키워드 알림 등록하기
          </Link>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            원하지 않는 딜은 어떻게 거르나요?
          </h2>
          <p>
            키워드는 제목에 그 글자가 들어가면 알림이 가요. 그래서 &quot;콜라&quot;를 등록하면
            &quot;콜라겐&quot;도 걸릴 수 있어요. 이럴 땐 키워드의 알림 조건에서{' '}
            <strong>제외할 단어</strong>
            (최대 10개)를 넣거나, <strong>가격 범위</strong>를 정해 그 밖의 딜은 빼세요. 가격을 읽지
            못한 글은 놓치지 않도록 조건과 상관없이 알려드려요.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            키워드 없이 받을 수는 없나요?
          </h2>
          <p>
            <Link href="/themes" className="underline underline-offset-2">
              관심사별 핫딜 알림
            </Link>
            을 켜면 키워드를 하나하나 등록하지 않아도 그 관심사에서 반응 좋은 딜만 하루 최대 3건
            보내드려요. 알림 설정의 &quot;지금 뜨는 좋은 딜&quot;도 관심 카테고리에서 반응이 뜨거운
            딜을 하루 최대 3번 알려드려요.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">알림이 안 올 때 확인할 것</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              휴대폰 설정에서 지름알림 앱 알림이 꺼져 있지 않은지, 웹이라면 브라우저 알림이 차단되지
              않았는지 확인해요.
            </li>
            <li>
              밤 9시부터 아침 8시 사이 알림은 야간 알림 수신에 동의하지 않으면 아침 8시에 모아서
              보내드려요. 마이페이지 알림 설정에서 바꿀 수 있어요.
            </li>
            <li>알림 조건(제외 단어·가격 범위)이 너무 좁지 않은지 확인해요.</li>
            <li>
              푸시를 가장 확실하게 받으려면{' '}
              <a href={LANDING_URL} className="underline underline-offset-2">
                지름알림 앱
              </a>
              을 쓰는 걸 권해요.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">요즘 많이 받는 키워드</h2>
          <ul className="flex flex-wrap gap-2">
            {POPULAR.map((h) => (
              <li key={h.slug}>
                <Link href={keywordHubPath(h)} className={cn('inline-block', linkChip)}>
                  {h.name} 핫딜
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={PAGE.KEYWORDS}
                className="inline-block rounded-full px-3 py-1.5 text-sm text-gray-500 underline underline-offset-2"
              >
                전체 키워드
              </Link>
            </li>
          </ul>
        </section>
      </article>
    </main>
  );
}
