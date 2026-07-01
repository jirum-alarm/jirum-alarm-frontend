'use client';

import { usePathname } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

import { AdvertiseSlotLocation } from '@/shared/api/gql/graphql';
import ScrollLock from '@/shared/ui/headless/ScrollLock';

import { useAdSlot } from '@/features/ad/model/useAdSlot';
import { AdvertiseBanner } from '@/features/banner';

const DISMISSED_SESSION_KEY_PREFIX = 'jirum:ad:interstitial:dismissed:';

export default function InterstitialPromotionAd() {
  const pathname = usePathname();

  if (pathname.startsWith('/promotion')) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <InterstitialPromotionAdContent />
    </Suspense>
  );
}

function InterstitialPromotionAdContent() {
  const { ads, recordImpression, recordClick } = useAdSlot(
    AdvertiseSlotLocation.SiwolPromotionEnter,
  );
  const creative = ads[0];
  const [canShow, setCanShow] = useState(false);

  useEffect(() => {
    if (!creative) {
      setCanShow(false);
      return;
    }

    try {
      const dismissedKey = getDismissedSessionKey(creative.id);
      setCanShow(window.sessionStorage.getItem(dismissedKey) !== '1');
    } catch {
      setCanShow(true);
    }
  }, [creative]);

  const dismiss = useCallback(() => {
    if (creative) {
      try {
        window.sessionStorage.setItem(getDismissedSessionKey(creative.id), '1');
      } catch {
        // sessionStorage 사용이 막힌 환경에서도 현재 화면에서는 닫히게 한다.
      }
    }

    setCanShow(false);
  }, [creative]);

  if (!creative || !canShow) {
    return null;
  }

  const creativeId = Number(creative.id);

  return (
    <ScrollLock>
      <div
        className="animate-fade-in fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 px-5 py-8"
        role="presentation"
        onClick={dismiss}
      >
        <div
          className="flex w-full max-w-[420px] flex-col"
          role="dialog"
          aria-modal="true"
          aria-label={creative.displayTitle ?? '프로모션 광고'}
          onClick={(event) => event.stopPropagation()}
        >
          <AdvertiseBanner
            creative={creative}
            className="mx-auto w-full"
            surfaceClassName="rounded-2xl border-0 bg-transparent shadow-[0_20px_70px_rgba(0,0,0,0.32)]"
            priority
            onImpression={() => {
              recordImpression(creativeId);
            }}
            onClickAd={() => {
              recordClick(creativeId);
            }}
          />
          <button
            type="button"
            className="bg-secondary-900 hover:bg-secondary-800 mt-3 flex h-12 w-full items-center justify-center rounded-xl text-base font-extrabold text-white shadow-[0_10px_30px_rgba(0,0,0,0.24)] transition-colors active:scale-[0.99]"
            onClick={dismiss}
          >
            닫기
          </button>
        </div>
      </div>
    </ScrollLock>
  );
}

function getDismissedSessionKey(creativeId: string) {
  return `${DISMISSED_SESSION_KEY_PREFIX}${creativeId}`;
}
