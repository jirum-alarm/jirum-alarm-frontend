'use client';

import { type AnchorHTMLAttributes, type MouseEvent } from 'react';

import {
  appHandoffHref,
  type HandoffPlatform,
  type HandoffSource,
  playStoreUrl,
} from '../model/appHandoff';

/** 앱도 Play 도 안 열리고 이 페이지가 그대로 보이면 Play 로 직접 보낸다. */
const ANDROID_STORE_FALLBACK_MS = 2000;

type OpenInAppLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  platform: HandoffPlatform;
  /** 앱에서 열 화면. 보통 지금 보고 있는 경로. */
  path: string;
  source: HandoffSource;
  /** iOS 에서도 앱을 열어 본다(유니버설 링크). 「앱으로 보기」처럼 앱을 연다고 말하는 버튼만 — appHandoffHref 참고. */
  iosUniversalLink?: boolean;
};

/**
 * 「앱에서 보기/앱 받기」 버튼의 링크 한 곳 — 앱이 있으면 이 화면을 앱으로, 없으면 출처를 실어 스토어로.
 * 규칙은 model/appHandoff.ts. 반드시 진짜 <a> 로 둔다: 유니버설 링크·intent 는 사용자 탭으로만 앱을 연다.
 *
 * 안드로이드는 intent 를 못 다루는 인앱 브라우저가 있을 수 있어(네이버 앱 인앱은 실기기 미확인) 2초 뒤에도
 * 이 페이지가 앞에 있으면 Play 로 보낸다. 앱이나 Play 가 열리면 페이지가 가려져(visibilitychange/pagehide/blur)
 * 타이머를 지운다.
 */
export default function OpenInAppLink({
  platform,
  path,
  source,
  iosUniversalLink,
  onClick,
  children,
  ...rest
}: OpenInAppLinkProps) {
  const href = appHandoffHref(platform, path, source, { iosUniversalLink });

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
      event: 'app_download_click',
      platform,
      source,
      link: href,
    });
    if (platform === 'android') armStoreFallback(playStoreUrl(source, path));
  };

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

function armStoreFallback(storeUrl: string) {
  const timer = window.setTimeout(() => {
    cleanup();
    if (document.visibilityState === 'visible') window.location.href = storeUrl;
  }, ANDROID_STORE_FALLBACK_MS);
  const cancel = () => {
    window.clearTimeout(timer);
    cleanup();
  };
  const onVisibility = () => {
    if (document.visibilityState === 'hidden') cancel();
  };
  function cleanup() {
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', cancel);
    window.removeEventListener('blur', cancel);
  }
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', cancel);
  window.addEventListener('blur', cancel);
}
