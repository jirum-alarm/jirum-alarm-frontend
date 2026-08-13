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
 * 피드(이미지 있을 때) / 텍스트 템플릿으로 친구 선택 화면을 연다.
 */
export const buildKakaoLinkUrl = ({
  title,
  description,
  imageUrl,
  url,
}: {
  title: string;
  description?: string;
  imageUrl?: string;
  url: string;
}): string => {
  const link = {web_url: url, mobile_web_url: url};
  const template = imageUrl
    ? {
        object_type: 'feed',
        content: {
          title,
          description: description ?? '',
          image_url: imageUrl,
          link,
        },
        buttons: [{title: '자세히 보기', link}],
      }
    : {
        object_type: 'text',
        text: description ? `${title}\n${description}` : title,
        link,
        button_title: '자세히 보기',
      };

  const extras = JSON.stringify({
    ka: `sdk/2.7.0 os/${Platform.OS} lang/ko-KR device/phone`,
  });

  return (
    `kakaolink://send?appkey=${KAKAO_NATIVE_APP_KEY}` +
    `&appver=1.0.0&apiver=10.0&linkver=4.0` +
    `&template_json=${encodeURIComponent(JSON.stringify(template))}` +
    `&extras=${encodeURIComponent(extras)}`
  );
};
