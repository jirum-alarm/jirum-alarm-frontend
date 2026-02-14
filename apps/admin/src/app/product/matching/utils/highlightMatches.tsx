import React from 'react';

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 브랜드명/상품명/용량/개수 등의 키워드를 텍스트에서 찾아 하이라이트 처리합니다.
 *
 * @param text - 원문 텍스트 (게시물 제목)
 * @param brandName - 브랜드명
 * @param productName - 상품명
 * @param extras - 추가 키워드 (용량, 개수 등)
 * @returns 하이라이트된 React 노드
 */
export function highlightMatches(
  text: string,
  brandName: string,
  productName: string,
  extras?: (string | null | undefined)[],
): React.ReactNode {
  const baseParts = `${brandName} ${productName}`.split(/\s+/);

  // extras에서 null/undefined 제거 후 내부 공백 기준 분리
  const extraParts = (extras ?? []).filter((v): v is string => !!v).flatMap((v) => v.split(/\s+/));

  const keywords = [...baseParts, ...extraParts]
    .filter((k) => k.length > 1)
    .sort((a, b) => b.length - a.length); // 긴 키워드 우선 매칭

  if (keywords.length === 0) return text;

  const pattern = new RegExp(`(${keywords.map(escapeRegExp).join('|')})`, 'gi');
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    const isMatch = keywords.some((k) => k.toLowerCase() === part.toLowerCase());
    if (isMatch) {
      return (
        <mark key={i} className="rounded bg-yellow-200/70 px-0.5 dark:bg-yellow-700/50">
          {part}
        </mark>
      );
    }
    return part;
  });
}
