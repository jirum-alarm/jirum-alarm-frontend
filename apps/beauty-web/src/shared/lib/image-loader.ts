/**
 * next/image 커스텀 로더 — 본 서비스(apps/web)의 이미지 최적화 엔드포인트 `/_next/image` 를 같이 쓴다.
 *
 * 왜: 이 앱은 basePath(/beauty) 아래에 떠서 자기 최적화기는 /beauty/_next/image 다. 그걸 쓰면 같은 상품 사진을
 * 두 파드가 따로 변환·캐시하고, 이 이미지에 sharp 까지 실어야 한다. 같은 도메인의 web 최적화기는 이미
 * cdn.jirum-alarm.com 을 허용하고 1년 캐시를 쥐고 있다. 그래서 basePath 없는 루트 경로를 돌려준다
 * (게이트웨이가 /beauty 밖은 web 파드로 보낸다. 로컬은 next.config.ts rewrites 가 운영으로 넘긴다).
 *
 * ⚠️ w 는 web 의 deviceSizes·imageSizes 안의 값이어야 한다(next.config.ts 에 같은 목록), q 는 web 이
 * qualities 를 따로 두지 않아 Next 16 기본값 75 만 허용된다 — 그래서 quality 인자는 무시한다.
 */
const WEB_ALLOWED_QUALITY = 75;

export default function imageLoader({ src, width }: { src: string; width: number }) {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${WEB_ALLOWED_QUALITY}`;
}
