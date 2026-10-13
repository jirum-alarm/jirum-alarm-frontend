/**
 * 검색 결과 주소. 입력 제출·최근/추천 칩·자동완성이 전부 이걸 쓴다.
 * 검색어를 그대로 붙이면 `&`·`#`·`+`·`%` 가 든 검색어가 잘리거나 바뀐다(예: "M&M" → keyword=M, "C#" → keyword=C).
 * 필터는 붙이지 않는다 — 새 검색=새 의도라 필터·정렬을 리셋한다(2026-07-22 디자인 리뷰 결정 6A).
 */
export const searchHref = (keyword: string) =>
  `/search?keyword=${encodeURIComponent(keyword.trim())}`;
