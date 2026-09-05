/**
 * 원격 이미지용 단색 placeholder.
 *
 * next/image 는 로컬 static import 에만 blurDataURL 을 자동 생성한다. 원격
 * (cdn.jirum-alarm.com) 썸네일은 직접 줘야 하고, 안 주면 회색 빈 칸에서
 * 그림으로 즉시 바뀌어 "이미지가 깜빡인다"로 읽힌다.
 *
 * 색은 카드 배경(bg-gray-50 = #f9fafb)과 같게 맞춘다 — 다르면 placeholder 가
 * 사라지는 순간이 오히려 눈에 띈다.
 *
 * ⚠️ opacity 페이드로 만들지 않는다. 크롬은 opacity:0 인 페인트를 LCP 후보에서
 * 제외하고, 1로 올려도 재등록되지 않아 LCP 가 뒤로 밀린다(쇼피파이는 전환을
 * 걷어내 LCP 6초 개선을 보고했다). placeholder 는 background-image 라 항상
 * 그려지므로 그 문제가 없다.
 *
 * 실제 이미지의 흐린 미리보기(per-image blurDataURL)를 쓰려면 크롤러에서
 * sharp 로 10px 썸네일을 만들어 저장해야 한다 — 딜 목록 썸네일에선 단색과
 * 체감 차이가 거의 없어 보류.
 */
export const REMOTE_IMAGE_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IGZpbGw9IiNmOWZhZmIiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz48L3N2Zz4=';
