'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { env } from 'next-runtime-env';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { IS_PRD } from '@/shared/config/env';

const GOOGLE_VIGNETTE_HASH = '#google_vignette';
const GOOGLE_VIGNETTE_Z_INDEX = 2147483647;

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
  const portalHost = useGoogleVignettePortalHost(isOpen && !disabled);

  const syncOpenState = useCallback(() => {
    if (disabled) {
      setIsOpen(false);
      return;
    }

    setIsOpen(window.location.hash === GOOGLE_VIGNETTE_HASH || hasGoogleVignetteOverlay());
  }, [disabled]);

  const closeGoogleVignette = useCallback(() => {
    if (window.location.hash !== GOOGLE_VIGNETTE_HASH) {
      setIsOpen(false);
      return;
    }

    window.history.back();
    setIsOpen(false);
  }, []);

  useEffect(() => {
    syncOpenState();

    window.addEventListener('hashchange', syncOpenState);
    window.addEventListener('popstate', syncOpenState);
    window.addEventListener('pageshow', syncOpenState);
    window.addEventListener('resize', syncOpenState);

    const observer = new MutationObserver(syncOpenState);
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    const intervalId = window.setInterval(syncOpenState, 500);

    return () => {
      observer.disconnect();
      window.clearInterval(intervalId);
      window.removeEventListener('hashchange', syncOpenState);
      window.removeEventListener('popstate', syncOpenState);
      window.removeEventListener('pageshow', syncOpenState);
      window.removeEventListener('resize', syncOpenState);
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

  if (!isOpen || disabled || !portalHost) {
    return null;
  }

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-5 mx-auto max-w-[420px]"
      data-google-vignette-close-control
      style={{
        bottom: 'max(16px, calc(16px + env(safe-area-inset-bottom)))',
        zIndex: GOOGLE_VIGNETTE_Z_INDEX,
      }}
    >
      <button
        type="button"
        className="bg-secondary-900 hover:bg-secondary-800 pointer-events-auto flex h-12 w-full items-center justify-center rounded-xl text-base font-extrabold text-white shadow-[0_10px_30px_rgba(0,0,0,0.24)] transition-colors active:scale-[0.99]"
        onClick={closeGoogleVignette}
      >
        닫기
      </button>
    </div>,
    portalHost,
  );
}

function useGoogleVignettePortalHost(enabled: boolean) {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) {
      setHost(null);
      return;
    }

    const portalElement = document.createElement('div');
    portalElement.dataset.googleVignetteClosePortal = 'true';

    const movePortalToEnd = () => {
      if (document.body.lastElementChild !== portalElement) {
        document.body.appendChild(portalElement);
      }
    };

    movePortalToEnd();
    setHost(portalElement);

    const observer = new MutationObserver(movePortalToEnd);
    observer.observe(document.body, { childList: true });

    return () => {
      observer.disconnect();
      portalElement.remove();
      setHost(null);
    };
  }, [enabled]);

  return host;
}

function hasGoogleVignetteOverlay() {
  const candidates = document.querySelectorAll<HTMLElement>(
    'ins, iframe, [id^="aswift_"], [id^="google_ads_iframe"]',
  );

  return Array.from(candidates).some((element) => {
    const style = window.getComputedStyle(element);
    const zIndex = Number.parseInt(style.zIndex, 10);

    if (
      style.position !== 'fixed' ||
      !Number.isFinite(zIndex) ||
      zIndex < GOOGLE_VIGNETTE_Z_INDEX - 10
    ) {
      return false;
    }

    const rect = element.getBoundingClientRect();

    return rect.width >= window.innerWidth * 0.9 && rect.height >= window.innerHeight * 0.9;
  });
}
