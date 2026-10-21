/**
 * 이 페이지로 들어온 입구 — 주소의 utm_source(예: ?utm_source=kakao_notice). 스토어 링크 캠페인에 실어 입구별 설치를 가른다.
 * 캠페인 값에 그대로 들어가니 영문·숫자·_- 만, 20자까지.
 */
export const parseEntrance = (search: string): string | null => {
  const value = new URLSearchParams(search).get('utm_source')?.toLowerCase() ?? '';
  const clean = value.replace(/[^a-z0-9_-]/g, '').slice(0, 20);
  return clean || null;
};
