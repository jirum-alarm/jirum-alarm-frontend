'use client';

import { useAtomValue } from 'jotai';
import { type AnchorHTMLAttributes, type MouseEvent, useEffect, useState } from 'react';

import { isJirumAlarmAppUA, isKakaoInAppUA } from '@/shared/config/user-agent';
import { isGuestAtom, isLoggedInAtom } from '@/shared/hooks/useIsLoggedIn';
import { appOpenUrl, isAppPath, KAKAO_APP_ATTEMPT_EVENT } from '@/shared/lib/kakao-app-open';

import { wasSuspended } from '../lib/watchAppSwitch';
import {
  appHandoffHref,
  appStoreUrl,
  type HandoffPlatform,
  type HandoffSource,
  playStoreUrl,
} from '../model/appHandoff';

/** 웹 기기 id 저장 키(useAlertSession·BrowserHandoffArrival 과 같다). */
const DEVICE_ID_KEY = 'jirum-alarm-device-id';

/** 앱도 스토어도 안 열리고 이 페이지가 그대로 보이면 스토어로 직접 보낸다. */
const STORE_FALLBACK_MS = 2000;

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
 * 이 페이지가 앞에 있으면 Play 로 보낸다. 카톡 인앱 iOS 는 앱 스킴으로 열어 보고 같은 식으로 App Store 로. 앱이나 Play 가 열리면 페이지가 가려져(visibilitychange/pagehide/blur)
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
  const guestDeviceId = useWebGuestDeviceId();
  const href = appHandoffHref(platform, path, source, { iosUniversalLink, guestDeviceId });

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
      event: 'app_download_click',
      platform,
      source,
      link: href,
    });
    const ua = navigator.userAgent;
    const inKakao = isKakaoInAppUA(ua) && !isJirumAlarmAppUA(ua);
    // 카톡 인앱 iOS 는 유니버설 링크(www)가 앱을 안 열고 웹 → App Store 로 떨어진다. 앱 스킴으로 열어 보고
    // 안 열리면 App Store — 카톡이 스킴은 다른 앱으로 넘긴다(shared/lib/kakao-app-open.ts).
    if (inKakao && platform === 'apple' && iosUniversalLink && isAppPath(path)) {
      event.preventDefault();
      window.location.href = appOpenUrl('ios', path, source, window.location.origin, guestDeviceId);
      armStoreFallback(appStoreUrl(source));
    } else if (platform === 'android') {
      armStoreFallback(playStoreUrl(source, path, guestDeviceId));
    }
    if (inKakao) window.dispatchEvent(new Event(KAKAO_APP_ATTEMPT_EVENT));
  };

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

/**
 * 웹 게스트면 게스트를 만든 기기 id — 링크에 실어 앱이 같은 게스트를 이어받게 한다(웹에서 건 키워드가 앱으로).
 * 회원은 싣지 않는다(앱에서 로그인하면 계정 키워드가 그대로 온다). localStorage 라 하이드레이션 뒤에 읽는다.
 */
function useWebGuestDeviceId(): string | null {
  const isGuest = useAtomValue(isGuestAtom);
  const isLoggedIn = useAtomValue(isLoggedInAtom);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  useEffect(() => {
    if (!isGuest || isLoggedIn) return;
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage 는 브라우저에만 있다. 서버 HTML(id 없는 링크)과 맞추려 하이드레이션 뒤에 읽는다.
      setDeviceId(window.localStorage.getItem(DEVICE_ID_KEY));
    } catch {
      // 저장소를 못 읽으면 이어받기 없이 그냥 연다.
    }
  }, [isGuest, isLoggedIn]);
  return isGuest && !isLoggedIn ? deviceId : null;
}

function armStoreFallback(storeUrl: string) {
  const startedAt = Date.now();
  const timer = window.setTimeout(() => {
    cleanup();
    // 카톡 iPhone 은 앱이 열려도 가려짐 이벤트를 안 보낸다 — 타이머가 늦게 깼으면 그 사이 앱이 앞에 있었던 것(10/15 실기기).
    if (wasSuspended(startedAt, STORE_FALLBACK_MS)) return;
    if (document.visibilityState === 'visible') window.location.href = storeUrl;
  }, STORE_FALLBACK_MS);
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
