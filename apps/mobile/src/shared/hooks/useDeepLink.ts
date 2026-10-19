import {useEffect, useRef} from 'react';
import {Linking} from 'react-native';

import {SERVICE_URL} from '@/constants/env';
import {normalizeDeepLink} from '@/shared/lib/navigation/deep-link';
import {readDeferredDeepLink} from '@/shared/lib/navigation/deferred-link';
import {openWhenNavigatorReady} from '@/shared/lib/navigation/open-when-ready';
import {Analytics} from '@/shared/lib/analytics/ga4';
import {
  offerWebGuestDeviceId,
  offerWebGuestHandoff,
} from '@/shared/lib/auth/web-guest-handoff';

/**
 * 외부 딥링크(카톡 공유·유니버설 링크·커스텀 스킴)로 앱을 여는 경로.
 *
 * 지금까지 스킴은 네이티브에 등록돼 있었지만 받는 쪽이 없어서, 링크를 눌러
 * 앱이 떠도 항상 홈이었다(공유가 사실상 무효). 푸시가 쓰는 열기 경로를
 * 그대로 재사용한다 — 네이티브 화면이 있으면 그쪽, 나머지는 웹뷰 주입.
 *
 * @param openInWebView 네이티브가 거른 URL 을 웹뷰로 넘기는 함수(FCMHandler 것과 동일).
 */
export default function useDeepLink(openInWebView: (url: string) => void) {
  const openRef = useRef(openInWebView);
  openRef.current = openInWebView;

  useEffect(() => {
    let cancelled = false;

    const open = (rawUrl: string, from: 'cold' | 'running' | 'deferred') => {
      const url = normalizeDeepLink(rawUrl);
      if (!url) return;
      // 웹 게스트가 「앱 열기」로 넘어왔으면(gd) 같은 게스트로 이어받게 맡긴다(useAdoptWebGuest).
      offerWebGuestHandoff(url);

      Analytics.track('deeplink_opened', {
        // 기기 id(gd)는 GA4 에 싣지 않는다.
        url: url.replace(/([?&#])gd=[^&#]*&?/, '$1').replace(/[?&#]$/, ''),
        platform: 'app',
        state: from,
      });

      // 콜드/실행중 **둘 다** 탭이 뜰 때까지 기다리는 같은 루프를 쓴다 — 실행 중이라도 앱이 막
      // 뜨는 중이면 네비게이터가 아직 없어서(부팅 창) 즉시 판정은 링크를 흘린다
      // (시뮬레이터에서 알림 링크가 홈에 머무는 걸 봤다). 푸시도 같은 루프다.
      openWhenNavigatorReady(url, u => openRef.current(u), {
        source: 'deeplink',
        isCancelled: () => cancelled,
      });
    };

    // 앱이 죽어 있다가 링크로 열린 경우. 링크 없이 열렸으면 설치 직후 첫 실행인지 보고, 웹에서 보던 화면이
    // Play referrer 에 실려 왔으면 그리로(안드로이드 디퍼드 딥링크 — deferred-link.ts).
    Linking.getInitialURL().then(async url => {
      if (cancelled) return;
      if (url) {
        open(url, 'cold');
        return;
      }
      const deferred = await readDeferredDeepLink();
      if (!deferred || cancelled) return;
      // 웹 게스트였으면 같은 게스트로 이어받는다(보던 경로가 홈이라 열 화면이 없어도).
      if (deferred.guestDeviceId) offerWebGuestDeviceId(deferred.guestDeviceId);
      if (deferred.path) open(`${SERVICE_URL}${deferred.path}`, 'deferred');
    });

    // 앱이 이미 떠 있는 상태에서 링크를 받은 경우.
    const sub = Linking.addEventListener('url', ({url}) =>
      open(url, 'running'),
    );

    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);
}
