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
 * 카톡 공유(iOS·Android 공통) — 카카오 JS SDK `Share.sendScrap` 과 같은 2단계.
 *
 * 1) scrap API 가 requestUrl 의 OG 를 긁어 **검증된 카드**(template_msg)를 돌려준다.
 * 2) 그 응답을 `template_json`·`template_args`·`template_id` 로 `kakaolink://send` 에 싣는다.
 *
 * 🔴 두 번 틀렸던 자리. ① 손으로 만든 카드를 template_json 에 실음 → 카톡이
 * "core parameter(s) missing" (검증 안 된 카드라서지 이름이 틀려서가 아니다).
 * ② 그래서 `request_url` 을 kakaolink 에 바로 실음 → 이건 1) API 의 파라미터라
 * 카톡은 받지 않는다. 정본 = SDK 2.7.7 `KakaoLink` 클래스(appkey·appver·linkver·
 * extras·template_json·template_args·template_id).
 */
const KAKAO_SCRAP_API =
  'https://kapi.kakao.com/v2/api/kakaolink/talk/template/scrap';

// ponytail: 검증 호출은 두 플랫폼 모두 카카오 콘솔에 등록된 iOS 번들 ID 로 한다.
// Android 는 origin 에 서명 키 해시가 필요한데 JS 에서 구할 수 없다. 카카오가 플랫폼
// 일치를 강제하면 콘솔의 Android 키 해시를 받아 os/android origin/<해시> 로 나눌 것.
const KAKAO_AGENT =
  'sdk/2.20.0 os/ios lang/ko-KR origin/com.jirum-alarm.jirumalarm';

export type KakaoScrap = {
  template_id: number;
  template_args?: Record<string, string>;
  template_msg: unknown;
};

export const fetchKakaoScrap = async (url: string): Promise<KakaoScrap> => {
  const res = await fetch(
    `${KAKAO_SCRAP_API}?link_ver=4.0&request_url=${encodeURIComponent(url)}`,
    {
      headers: {
        Authorization: `KakaoAK ${KAKAO_NATIVE_APP_KEY}`,
        KA: KAKAO_AGENT,
      },
    },
  );
  const body = await res.json();
  if (!res.ok || !body?.template_msg) {
    throw new Error(`kakao scrap ${res.status}: ${body?.msg ?? ''}`);
  }
  return body;
};

export const buildKakaoLinkUrl = (scrap: KakaoScrap): string => {
  const params: Record<string, unknown> = {
    appkey: KAKAO_NATIVE_APP_KEY,
    appver: '1.0',
    linkver: '4.0',
    extras: {KA: KAKAO_AGENT},
    template_json: scrap.template_msg,
    template_args: scrap.template_args,
    template_id: scrap.template_id,
  };
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .map(
      ([k, v]) =>
        `${k}=${encodeURIComponent(
          typeof v === 'object' ? JSON.stringify(v) : String(v),
        )}`,
    )
    .join('&');
  return `kakaolink://send?${query}`;
};
