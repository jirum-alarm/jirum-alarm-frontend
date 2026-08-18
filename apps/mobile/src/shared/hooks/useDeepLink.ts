import {useEffect, useRef} from 'react';
import {Linking} from 'react-native';

import {normalizeDeepLink} from '@/shared/lib/navigation/deep-link';
import {navigateToProductDetail} from '@/navigations/navigation-ref';
import {MixpanelService} from '@/shared/lib/analytics/mixpanel';

/**
 * 외부 딥링크(카톡 공유·유니버설 링크·커스텀 스킴)로 앱을 여는 경로.
 *
 * 지금까지 스킴은 네이티브에 등록돼 있었지만 받는 쪽이 없어서, 링크를 눌러
 * 앱이 떠도 항상 홈이었다(공유가 사실상 무효). 푸시가 쓰는 열기 경로를
 * 그대로 재사용한다 — 상세는 네이티브 push, 나머지는 웹뷰 주입.
 *
 * @param openInWebView 상세가 아닌 URL 을 웹뷰로 넘기는 함수(FCMHandler 것과 동일).
 */
export default function useDeepLink(openInWebView: (url: string) => void) {
  // 콜드 스타트에서는 네비게이터가 아직 없다. 준비될 때까지 들고 있는다.
  const pendingRef = useRef<string | null>(null);
  const openRef = useRef(openInWebView);
  openRef.current = openInWebView;

  useEffect(() => {
    let cancelled = false;

    const open = (rawUrl: string, from: 'cold' | 'running') => {
      const url = normalizeDeepLink(rawUrl);
      if (!url) return;

      MixpanelService.track('deeplink_opened', {
        url,
        platform: 'app',
        state: from,
      });

      // 콜드 스타트는 네비게이터가 뜰 때까지 재시도한다(푸시와 같은 문제).
      const attempt = (retry = 0) => {
        if (cancelled) return;
        if (navigateToProductDetail(url)) return;
        if (retry > 10) {
          // 상세가 아니거나 끝내 준비 안 됨 → 웹뷰가 맡는다.
          openRef.current(url);
          return;
        }
        setTimeout(() => attempt(retry + 1), 300);
      };

      // 실행 중이면 즉시 판정한다. 상세가 아니면 바로 웹뷰로.
      if (from === 'running') {
        if (!navigateToProductDetail(url)) openRef.current(url);
        return;
      }
      pendingRef.current = url;
      attempt();
    };

    // 앱이 죽어 있다가 링크로 열린 경우.
    Linking.getInitialURL().then(url => {
      if (url && !cancelled) open(url, 'cold');
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
