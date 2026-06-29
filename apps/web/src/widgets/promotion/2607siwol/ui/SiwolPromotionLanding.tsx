'use client';

import { motion } from 'motion/react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { AdvertiseSlotLocation } from '@/shared/api/gql/graphql';
import { LANDING_URL } from '@/shared/config/env';
import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';
import { Search } from '@/shared/ui/common/icons';
import { IconLogo } from '@/shared/ui/common/icons/Illust';
import TalkLight from '@/shared/ui/common/icons/TalkLight';
import Link from '@/shared/ui/Link';

import { useAdSlot } from '@/features/ad/model/useAdSlot';

const SECRET_CODE = 'jirums';
const EVENT_ENTRY_URL = 'https://www.yogeum.com/jirums';
const KAKAO_TALKROOM_URL = 'https://open.kakao.com/o/gJZTWAAg';

const pricePlans = [
  { label: '100GB', period: '4개월간 월', price: '5,510원' },
  { label: '매일 5GB+5Mbps', period: '4개월간 월', price: '5,510원' },
  { label: '100GB', period: '4개월간 월', price: '5,510원' },
  { label: '15GB', period: '평생 월', price: '2,200원' },
  { label: '매일 5GB+5Mbps', period: '평생 월', price: '27,500원' },
  { label: '매일 5GB', period: '평생 월', price: '24,200원' },
];

const steps = [
  '지름알림 시크릿 코드 복사하기',
  '하단 입장하기 버튼 클릭하기',
  '입력창에 비밀번호 붙여넣기',
];

export function SiwolPromotionLanding() {
  const searchParams = useSearchParams();
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const rollingPlans = useMemo(() => [...pricePlans, ...pricePlans], []);

  useEffect(() => {
    if (searchParams.get('t') === '1') {
      return;
    }

    if (!isJirumAlarmReferrer(document.referrer, window.location.hostname)) {
      window.location.replace(PAGE.HOME);
    }
  }, [searchParams]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SECRET_CODE);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1600);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 1600);
    }
  };

  return (
    <main className="min-h-dvh bg-[#0d1726] text-white">
      <PromotionHeader />
      <section className="mx-auto flex w-full max-w-[480px] flex-col px-5 pt-10 pb-10 sm:px-0">
        <div className="text-center">
          <p className="text-xs leading-[18px] font-medium text-[#8b96a9]">26.07.01 - 26.08.01</p>
          <CollaborationBadge />
          <h1 className="mt-5 text-[28px] leading-9 font-extrabold tracking-normal sm:text-[24px]">
            <span className="block text-[#fff200]">프로 절약러를 위한</span>
            <span className="block text-white">0원 이벤트</span>
          </h1>
        </div>

        <div className="mt-7 flex flex-col gap-4">
          <EventCard plans={rollingPlans} />
          {/* 입장하기 노출/클릭 추적은 광고 creative 조회가 필요해 Suspense로 격리.
              광고 미등록·로딩 중이어도 입장하기는 정상 동작(추적만 생략). */}
          <Suspense fallback={<CodeCard copyState={copyState} onCopy={handleCopy} />}>
            <TrackedCodeCard copyState={copyState} onCopy={handleCopy} />
          </Suspense>
          <InfoCard />
        </div>
      </section>
    </main>
  );
}

// siwol_promotion_enter creative로 입장하기 노출/클릭 추적을 붙인 CodeCard.
function TrackedCodeCard({
  copyState,
  onCopy,
}: {
  copyState: 'idle' | 'copied' | 'failed';
  onCopy: () => void;
}) {
  const { ads, recordImpression, recordClick } = useAdSlot(
    AdvertiseSlotLocation.SiwolPromotionEnter,
  );
  const enterAdId = ads[0] ? Number(ads[0].id) : null;
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });

  useEffect(() => {
    if (inView && enterAdId != null) recordImpression(enterAdId);
  }, [inView, enterAdId, recordImpression]);

  return (
    <CodeCard
      copyState={copyState}
      onCopy={onCopy}
      enterRef={ref}
      onEnter={() => enterAdId != null && recordClick(enterAdId)}
    />
  );
}

function CollaborationBadge() {
  return (
    <div className="mx-auto mt-5 inline-flex h-9 items-center gap-2 rounded-xl bg-white px-3">
      <div className="flex shrink-0 items-center gap-1.5">
        <IconLogo width={23} height={23} className="size-[23px]" />
        <span className="text-sm leading-none font-extrabold whitespace-nowrap text-[#162034]">
          지름알림
        </span>
      </div>
      <span className="flex size-4 shrink-0 items-center justify-center text-xl leading-none font-light text-[#1f1f1f]">
        ×
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element -- 원본 로고 PNG를 Next 이미지 최적화 없이 그대로 렌더링한다. */}
      <img
        src="/images/promotion/2607siwol/siwol-mobile-logo.png"
        alt="시월모바일"
        className="h-5 w-auto shrink-0"
      />
    </div>
  );
}

function isJirumAlarmReferrer(referrer: string, currentHostname: string) {
  if (!referrer) {
    return false;
  }

  try {
    const { hostname } = new URL(referrer);

    return (
      hostname === currentHostname ||
      hostname === 'jirum-alarm.com' ||
      hostname.endsWith('.jirum-alarm.com')
    );
  } catch {
    return false;
  }
}

function PromotionHeader() {
  return (
    <header className="sticky top-0 z-20 h-14 border-b border-white/10 bg-[#0d1726]">
      <div className="mx-auto flex h-full w-full max-w-[1280px] items-center justify-between px-5">
        <nav className="flex h-full items-center gap-11">
          <Link href={PAGE.HOME} className="flex items-center gap-2 rounded-lg py-1">
            <IconLogo width={30} height={30} />
            <span className="text-lg font-bold text-white">지름알림</span>
          </Link>
          <div className="hidden h-full items-center gap-10 text-sm font-semibold text-white md:flex">
            <Link href={PAGE.TRENDING_LIVE} className="hover:text-primary-400 transition-colors">
              실시간
            </Link>
            <Link href={PAGE.TRENDING_RANKING} className="hover:text-primary-400 transition-colors">
              랭킹
            </Link>
            <Link
              href={LANDING_URL}
              prefetch={false}
              className="hover:text-primary-400 transition-colors"
            >
              소개
            </Link>
          </div>
        </nav>
        <div className="flex items-center gap-4 md:gap-5">
          <Link
            href={PAGE.SEARCH}
            className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
            aria-label="검색"
          >
            <Search width={28} height={28} color="#ffffff" />
          </Link>
          <Link
            href={KAKAO_TALKROOM_URL}
            target="_blank"
            className="hidden size-9 items-center justify-center rounded-full transition-colors hover:bg-white/10 md:flex"
            aria-label="핫딜 카톡방 입장"
          >
            <TalkLight width={28} height={28} />
          </Link>
          <Link
            href={PAGE.LOGIN}
            className="hidden rounded-full bg-[#27364e] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#33445f] md:block"
          >
            로그인
          </Link>
        </div>
      </div>
    </header>
  );
}

function EventCard({ plans }: { plans: typeof pricePlans }) {
  return (
    <article className="overflow-hidden rounded-[18px] bg-[#9c88ff] shadow-[0_18px_60px_rgba(47,32,126,0.3)]">
      <div className="flex h-12 items-center justify-center bg-[#9f8aff] text-sm font-bold text-white">
        지름알림 단독 이벤트
      </div>
      <div className="relative overflow-hidden bg-linear-to-b from-[#785cf4] to-[#a490ff] py-7">
        <div className="flex w-max animate-[promotion-price-roll_22s_linear_infinite] gap-2.5">
          {plans.map((plan, index) => (
            <PriceCard key={`${plan.label}-${plan.period}-${index}`} plan={plan} />
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <div className="relative rounded-md bg-[#5545b7] px-7 py-3 text-center text-sm leading-6 font-extrabold text-white shadow-sm before:absolute before:top-[-8px] before:left-1/2 before:size-0 before:-translate-x-1/2 before:border-x-[7px] before:border-b-[8px] before:border-x-transparent before:border-b-[#5545b7]">
            통신비 아끼는
            <br />
            알뜰폰 가격 궁금하다면?
          </div>
        </div>
      </div>
    </article>
  );
}

function PriceCard({ plan }: { plan: (typeof pricePlans)[number] }) {
  return (
    <div className="flex h-24 min-w-[174px] shrink-0 flex-col items-center justify-center rounded-lg bg-white px-3 text-[#17105f]">
      <div className="rounded-md bg-[#4530b3] px-3 py-1 text-xs leading-5 font-bold text-white">
        {plan.label}
      </div>
      <div className="mt-3 flex items-baseline gap-1 whitespace-nowrap">
        <span className="text-sm font-extrabold">{plan.period}</span>
        <span className="text-xl leading-6 font-extrabold">{plan.price}</span>
      </div>
    </div>
  );
}

function CodeCard({
  copyState,
  onCopy,
  enterRef,
  onEnter,
}: {
  copyState: 'idle' | 'copied' | 'failed';
  onCopy: () => void;
  enterRef?: (node?: Element | null) => void;
  onEnter?: () => void;
}) {
  return (
    <article className="rounded-[18px] bg-white p-5 text-[#162034]">
      <div className="rounded-t-lg bg-[#f1f3f6] px-6 py-5">
        <ol className="mx-auto flex max-w-[228px] flex-col gap-2 text-sm leading-6 font-bold">
          {steps.map((step, index) => (
            <li key={step} className="flex items-start gap-3">
              <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-[#dfe5ec] text-base font-bold text-[#5f6b7b]">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex h-12 items-center justify-center gap-3 rounded-b-lg bg-[#162034] px-4">
        <span className="text-sm font-extrabold text-[#92ff1f]">비밀번호</span>
        <strong className="text-sm font-extrabold text-white">{SECRET_CODE}</strong>
        <button
          type="button"
          onClick={onCopy}
          className="ml-1 flex h-8 items-center gap-1.5 rounded-full bg-[#344054] px-3 text-xs font-bold text-white transition-colors hover:bg-[#475467]"
          aria-label="비밀번호 복사하기"
        >
          <span className="relative block size-4 before:absolute before:top-[2px] before:left-[2px] before:size-[10px] before:rounded-[2px] before:border before:border-white/80 after:absolute after:right-[1px] after:bottom-[1px] after:size-[10px] after:rounded-[2px] after:border after:border-white" />
          {copyState === 'copied' ? '복사됨' : copyState === 'failed' ? '실패' : '복사하기'}
        </button>
      </div>
      <motion.a
        ref={enterRef}
        href={EVENT_ENTRY_URL}
        className="bg-primary-500 hover:bg-primary-400 mt-3 flex h-12 items-center justify-center rounded-lg text-sm font-extrabold text-black transition-colors"
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
        onClick={onEnter}
      >
        입장하기
      </motion.a>
    </article>
  );
}

function InfoCard() {
  return (
    <aside className="rounded-xl bg-[#1a293b] px-4 py-3 text-xs leading-[18px] text-[#c0cad8]">
      <p className="mb-1 font-medium">안내</p>
      <ul className="list-disc space-y-0.5 pl-4">
        <li>지름알림 파트너사의 알뜰폰 서비스를 소개해요.</li>
        <li>상품 관련 문의는 파트너사에서 도움받을 수 있어요.</li>
      </ul>
    </aside>
  );
}
