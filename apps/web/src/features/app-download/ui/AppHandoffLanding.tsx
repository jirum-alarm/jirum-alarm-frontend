'use client';

import { useEffect } from 'react';

import { isJirumAlarmAppUA } from '@/shared/config/user-agent';

import { appStoreUrl, readHandoffHash } from '../model/appHandoff';

/**
 * iOS 「앱에서 보기」가 앱을 못 열고 웹으로 떨어진 경우의 착지(#handoff=<source>).
 *
 * 앱이 깔려 있으면 유니버설 링크가 이 페이지를 열기 전에 앱으로 간다 — 여기 도착했다는 건 앱이 없거나
 * (인앱 브라우저처럼) 유니버설 링크가 안 되는 곳이다. 사용자가 방금 「앱」을 눌렀으니 App Store 로 보낸다.
 * App Store 에도 「열기」가 있어 앱이 있는데 못 연 사람도 막히지 않는다.
 *
 * 해시는 먼저 지운다 — 뒤로 와서 다시 튕기거나, 주소를 복사해 공유할 때 따라가지 않게.
 * 앱 웹뷰 안(앱이 못 그리는 경로를 웹뷰로 열 때 해시가 따라올 수 있다)에선 아무것도 안 한다.
 */
export default function AppHandoffLanding() {
  useEffect(() => {
    const source = readHandoffHash(window.location.hash);
    if (!source) return;
    const { pathname, search } = window.location;
    window.history.replaceState(window.history.state, '', pathname + search);

    const ua = navigator.userAgent;
    if (isJirumAlarmAppUA(ua) || !/iPhone|iPad|iPod/i.test(ua)) return;
    window.location.href = appStoreUrl(source);
  }, []);

  return null;
}
