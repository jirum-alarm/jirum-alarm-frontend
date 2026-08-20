import {Platform} from 'react-native';

import {SERVICE_URL} from '@/constants/env';

export type ShareChannel = 'kakao' | 'x' | 'threads' | 'copy' | 'native';

/** Info.plist / strings.xml 의 kakao_app_key 와 같다. kakaolink 스킴에 필요하다. */
export const KAKAO_NATIVE_APP_KEY = 'a14549f2c54214ea2a05669c34a3f11f';

/**
 * 공유 URL. 유입 시 붙어 온 utm 이 재공유로 전파되면 채널 귀속이 오염되므로
 * 기존 utm 을 제거하고 채널별 utm 으로 교체한다(web buildShareUrl 과 같다).
 *
 * RN 의 URL.searchParams 는 키 순회·삭제가 타입/구현 모두 불완전해서 쿼리를 직접 조립한다.
 */
export const buildShareUrl = (href: string, channel: ShareChannel): string => {
  const hashIndex = href.indexOf('#');
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : '';
  const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const qIndex = withoutHash.indexOf('?');
  const path = qIndex >= 0 ? withoutHash.slice(0, qIndex) : withoutHash;
  const query = qIndex >= 0 ? withoutHash.slice(qIndex + 1) : '';
  const kept = query
    .split('&')
    .filter(Boolean)
    .filter(
      pair => !decodeURIComponent(pair.split('=')[0] ?? '').startsWith('utm_'),
    );
  const medium = channel === 'native' ? 'native_share' : channel;
  kept.push('utm_source=share', `utm_medium=${encodeURIComponent(medium)}`);
  return `${path}?${kept.join('&')}${hash}`;
};

export const buildProductShareUrl = (
  productId: number,
  channel: ShareChannel,
): string => buildShareUrl(`${SERVICE_URL}/products/${productId}`, channel);

/**
 * 카톡 등은 미리보기(OG)를 늘 보여주지 않아 링크만 오면 뭘 받았는지 모른다.
 * 링크는 항상 마지막 줄 — 그래야 URL 을 미리보기로 잡는다.
 */
export const buildShareMessage = (
  title: string,
  url: string,
  description?: string,
): string =>
  description ? `${title}\n${description}\n${url}` : `${title}\n${url}`;

/** 링크를 제외한 본문(제목 + 설명). intent 의 caption 용. */
export const buildCaption = (title: string, description?: string): string =>
  description ? `${title}\n${description}` : title;

/**
 * SNS intent URL. `caption` 은 링크를 뺀 본문이어야 한다 —
 * x 는 url 을 별도 파라미터로 받으므로 본문에 링크가 있으면 두 번 들어간다.
 *
 * 실제 오픈은 openInAppBrowser 가 twitter:// · barcelona:// 로 바꿔 앱을 띄운다.
 */
export const buildIntentUrl = (
  channel: 'x' | 'threads',
  caption: string,
  url: string,
): string => {
  if (channel === 'x') {
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      caption,
    )}&url=${encodeURIComponent(url)}`;
  }
  return `https://www.threads.net/intent/post?text=${encodeURIComponent(
    `${caption}\n${url}`,
  )}`;
};

/**
 * Android 에서 OS 시트 없이 카톡 패키지로 바로 SEND.
 * 카톡이 메시지를 받아 친구 선택 화면을 연다. URL 은 카톡이 OG 로 펼친다.
 */
export const buildKakaoAndroidSendIntent = (message: string): string =>
  'intent:#Intent;' +
  'action=android.intent.action.SEND;' +
  'type=text/plain;' +
  'package=com.kakao.talk;' +
  `S.android.intent.extra.TEXT=${encodeURIComponent(message)};` +
  'end';

/**
 * iOS 카톡 공유. kakaolink:// 는 로그인 SDK 가 이미 Info.plist 에 등록돼 있다.
 *
 * ★ scrap 방식 = 카톡이 requestUrl 의 OG 태그를 직접 긁어 카드를 만든다.
 * 상세 페이지엔 og:title/description/image 가 상품별로 완비돼 있으므로
 * (web 의 generateMetadata) 카드 규격을 앱에서 손으로 조립하지 않는다.
 * web ShareSheet 이 쓰는 `Kakao.Share.sendScrap({requestUrl})` 과 같은 방식.
 *
 * 🔴 이전 구현은 `template_json` 파라미터에 손으로 만든 카드를 실어 보냈고
 * 카톡이 "core parameter(s) missing" 으로 거부했다. kakaolink 규격의 파라미터는
 * `template_json` 이 아니라 아래 세 조합 중 하나다:
 *   - scrap:   template_id 없이 `request_url` (OG 스크랩)
 *   - custom:  `template_id` (+ `template_args`) — 카카오 콘솔에 등록한 템플릿
 *   - default: `template_object` — 카드를 직접 조립
 * 손조립(default)은 규격이 바뀌면 조용히 깨지고 OG 와 이중관리가 되므로 scrap 을 쓴다.
 */
export const buildKakaoLinkUrl = ({url}: {url: string}): string => {
  const extras = JSON.stringify({
    ka: `sdk/2.7.0 os/${Platform.OS} lang/ko-KR device/phone`,
  });

  return (
    `kakaolink://send?appkey=${KAKAO_NATIVE_APP_KEY}` +
    `&appver=1.0.0&apiver=10.0&linkver=4.0` +
    `&request_url=${encodeURIComponent(url)}` +
    `&extras=${encodeURIComponent(extras)}`
  );
};
