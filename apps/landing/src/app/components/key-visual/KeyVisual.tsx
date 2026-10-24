import { COMMUNITY_COUNT, SERVICE_STATS } from '@jirum/domain/service-facts';
import Image from 'next/image';
import Link from 'next/link';

import { PAGE } from '@/shared/constants/page';

import AppDownload from './AppDownload';
import HeroPhone from './HeroPhone';

/**
 * 첫 화면 — 무엇을 해 주는지 한 줄(칩) → 약속(제목) → 어떻게(설명) → 설치 → 숫자 → 실제로 오는 알림(폰).
 * 브랜드 이름만 크게 걸던 히어로(「지름알림 / 득템의 시작」)는 무엇이 좋은지를 말하지 않았다(2026-10-21 개편).
 * 약속은 「진짜 싼지」 — 사람은 편해서가 아니라 싸게 사려고 온다(/help 와 같은 원칙). 숫자는 /help 와 같은 정본을 쓴다.
 */
const KeyVisual = () => (
  <section className="mx-auto flex w-full flex-col bg-white px-5 pt-14 pb-5 lg:px-8 lg:pb-9">
    {/* eslint-disable-next-line no-restricted-syntax -- 히어로 전용 모서리(28px) */}
    <div className="relative w-full overflow-hidden rounded-[28px] rounded-bl-none">
      <div className="from-fixed-900 to-landing-background absolute inset-0 bg-linear-to-b" />
      {/* 제목 뒤 은은한 라임 빛 — 짙은 판이 납작해 보이지 않게 */}
      <div className="bg-primary-500/15 pointer-events-none absolute -top-32 left-1/2 size-96 -translate-x-1/2 rounded-full blur-3xl lg:left-1/3" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pt-12 pb-28 lg:grid-cols-[1fr_auto] lg:gap-10 lg:px-12 lg:pt-20 lg:pb-32 xl:gap-40">
        <div className="flex flex-col items-center text-center break-keep lg:items-start lg:text-left">
          <p className="border-fixed-white/15 bg-fixed-white/5 text-fixed-300 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium">
            <span className="bg-primary-500 size-2 rounded-full" />
            커뮤니티 핫딜 · 가격 근거 · 키워드 알림
          </p>
          <h1 className="text-fixed-white mt-5 text-[36px] leading-tight font-bold md:text-[52px] lg:text-[60px]">
            핫딜이 뜨면 바로,
            <br />
            <span className="text-primary-500">진짜 싼지까지</span>
          </h1>
          <p className="text-fixed-300 mt-5 max-w-xl text-base leading-relaxed md:text-lg">
            커뮤니티 {COMMUNITY_COUNT}의 핫딜을 한곳에 모으고, 같은 상품의 지난 핫딜가·다나와·쿠팡
            가격과 비교할 수 있는 딜엔 근거를 붙여요. 키워드만 걸어 두면 올라오는 순간 알려드려요.
          </p>

          <AppDownload type="key-visual" />
          <a
            href={PAGE.BASE}
            className="text-fixed-300 mt-4 text-sm font-medium underline underline-offset-4 lg:hidden"
          >
            설치 없이 웹에서 먼저 보기
          </a>

          <ul className="mt-10 grid w-full max-w-md grid-cols-3 gap-2 lg:mt-12">
            {SERVICE_STATS.map((s) => (
              <li key={s.label} className="flex flex-col items-center lg:items-start">
                <strong className="text-fixed-white md:text-28 text-2xl font-bold">
                  {s.value}
                </strong>
                <span className="text-fixed-400 mt-1 text-xs md:text-sm">{s.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <HeroPhone />
      </div>

      <div className="absolute bottom-0 left-0">
        {/* eslint-disable-next-line no-restricted-syntax -- 오목한 모서리 트릭(흰 그림자로 바깥을 칠한다) */}
        <div className="h-16 w-16 rounded-bl-3xl shadow-[0_36px_0_rgb(255,255,255)]" />
        <div className="flex items-end">
          <Link
            href="https://open.kakao.com/o/gJZTWAAg"
            target="_blank"
            className="flex h-16 items-center gap-x-4 rounded-tr-4xl bg-white px-5 lg:px-10 lg:py-9.5"
          >
            <span className="text-xl font-semibold">핫딜 카톡방 입장</span>
            <div className="bg-primary-500 flex h-8 w-8 items-center justify-center rounded-full">
              <Image src="/assets/icons/arrow-right.svg" alt="" width={24} height={24} />
            </div>
          </Link>
          {/* eslint-disable-next-line no-restricted-syntax -- 오목한 모서리 트릭(흰 그림자로 바깥을 칠한다) */}
          <div className="h-16 w-16 rounded-bl-3xl shadow-[0_36px_0_rgb(255,255,255)]" />
        </div>
      </div>
    </div>
  </section>
);

export default KeyVisual;
