/**
 * 인앱 브라우저 → 기본 브라우저 넘기기(웹 푸시용).
 *
 * 왜: 상세 방문자의 31% 가 안드로이드 네이버 앱 인앱(웹 푸시 API 없음)이다(2026-10-09 GA4).
 * 같은 폰의 크롬·삼성 인터넷은 웹 푸시가 된다. 브라우저가 바뀌면 쿠키·localStorage 가 달라
 * 게스트도 새로 생기므로, 게스트를 만든 기기 id 를 주소(gd)에 실어 보내 도착한 브라우저가 이어받는다
 * (백엔드 guestLogin 은 같은 기기 id 에 같은 게스트를 준다 — 실제 계정 세션은 절대 주지 않는다).
 */
export const HANDOFF_DEVICE_PARAM = 'gd';
export const HANDOFF_PUSH_PARAM = 'push';

/** UA 판정은 호출부가 shared/config/user-agent 로 한다(이 파일은 node --test 로 바로 돌게 import 없이 둔다). */
export const canHandoffToBrowser = (d: {
  isAndroid: boolean;
  isInAppBrowser: boolean;
  hasNotificationApi: boolean;
}): boolean => !d.hasNotificationApi && d.isAndroid && d.isInAppBrowser;

/**
 * 안드로이드 intent 링크 — 패키지를 지정하지 않아 기본 브라우저가 연다.
 * 인텐트를 못 다루는 곳이면 fallback(같은 https 주소)으로 그 자리에서 연다.
 */
export const browserHandoffUrl = (href: string, deviceId: string): string => {
  const url = new URL(href);
  url.searchParams.set(HANDOFF_DEVICE_PARAM, deviceId);
  url.searchParams.set(HANDOFF_PUSH_PARAM, '1');
  const fallback = encodeURIComponent(url.toString());
  return `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;S.browser_fallback_url=${fallback};end`;
};

/** 도착한 주소에서 넘기기 표시를 읽고, 지운 주소를 돌려준다(주소창·공유 링크에 기기 id 가 남지 않게). */
export const readHandoff = (href: string) => {
  const url = new URL(href);
  const deviceId = url.searchParams.get(HANDOFF_DEVICE_PARAM);
  const wantsPush = url.searchParams.get(HANDOFF_PUSH_PARAM) === '1';
  url.searchParams.delete(HANDOFF_DEVICE_PARAM);
  url.searchParams.delete(HANDOFF_PUSH_PARAM);
  return { deviceId, wantsPush, cleanUrl: url.pathname + url.search + url.hash };
};
