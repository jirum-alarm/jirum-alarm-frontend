'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { env } from 'next-runtime-env';
import { useCallback, useEffect, useState } from 'react';

import { IS_PRD } from '@/shared/config/env';

const GOOGLE_VIGNETTE_HASH = '#google_vignette';

export const AdSenseProvider = () => {
  const pathname = usePathname();
  const clientId = env('NEXT_PUBLIC_ADSENSE_CLIENT_ID') ?? '';
  const isPromotionPath = pathname.startsWith('/promotion');

  if (!IS_PRD || !clientId) {
    return null;
  }

  return (
    <>
      <GoogleVignetteCloseControl disabled={isPromotionPath} />
      {!isPromotionPath && (
        <Script
          id="adsense"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}
    </>
  );
};

function GoogleVignetteCloseControl({ disabled }: { disabled: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  const syncOpenState = useCallback(() => {
    setIsOpen(window.location.hash === GOOGLE_VIGNETTE_HASH);
  }, []);

  const closeGoogleVignette = useCallback(() => {
    if (window.location.hash !== GOOGLE_VIGNETTE_HASH) {
      setIsOpen(false);
      return;
    }

    const oldUrl = window.location.href;
    const nextUrl = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(window.history.state, '', nextUrl);
    window.dispatchEvent(
      new HashChangeEvent('hashchange', { oldURL: oldUrl, newURL: window.location.href }),
    );
    setIsOpen(false);
  }, []);

  useEffect(() => {
    syncOpenState();

    window.addEventListener('hashchange', syncOpenState);
    window.addEventListener('popstate', syncOpenState);

    return () => {
      window.removeEventListener('hashchange', syncOpenState);
      window.removeEventListener('popstate', syncOpenState);
    };
  }, [syncOpenState]);

  useEffect(() => {
    if (disabled && window.location.hash === GOOGLE_VIGNETTE_HASH) {
      closeGoogleVignette();
    }
  }, [closeGoogleVignette, disabled]);

  useEffect(() => {
    if (!isOpen || disabled) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      if (target.closest('[data-google-vignette-close-control]')) {
        return;
      }
      if (target.closest('iframe, ins.adsbygoogle')) {
        return;
      }

      closeGoogleVignette();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeGoogleVignette();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [closeGoogleVignette, disabled, isOpen]);

  if (!isOpen || disabled) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-5 bottom-[max(16px,calc(16px+env(safe-area-inset-bottom)))] z-[2147483647] mx-auto max-w-[420px]"
      data-google-vignette-close-control
    >
      <button
        type="button"
        className="bg-secondary-900 hover:bg-secondary-800 pointer-events-auto flex h-12 w-full items-center justify-center rounded-xl text-base font-extrabold text-white shadow-[0_10px_30px_rgba(0,0,0,0.24)] transition-colors active:scale-[0.99]"
        onClick={closeGoogleVignette}
      >
        닫기
      </button>
    </div>
  );
}
