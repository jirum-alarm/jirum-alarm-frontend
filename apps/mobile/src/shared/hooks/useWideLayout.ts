import {gridColumns, layout} from '@jirum/design-system/layout';
import {useContentWidth} from '@/shared/components/SideSafeArea';

/**
 * 넓은 화면(아이폰 듀오 펼침·가로 모드) 규칙 — 값은 design-system layout.wide 가 정본.
 * 폰 폭에선 아무것도 바뀌지 않는다.
 */

/** 폭에 맞춘 상품 그리드 열 수. 폰에선 base 그대로, 넓으면 카드 크기를 지키며 열을 늘린다. */
export function useGridColumns(base: 2 | 3): number {
  return gridColumns(useContentWidth(), base);
}

/**
 * «더보기»가 있는 미리보기 그리드는 꽉 찬 줄까지만 — 열이 늘면 마지막 줄에 한두 장만 남아 빈칸이 눈에 띈다.
 * 한 줄도 못 채우면 그대로 둔다.
 */
export const fullRows = <T>(items: T[], columns: number): T[] =>
  items.length > columns
    ? items.slice(0, Math.floor(items.length / columns) * columns)
    : items;

/** 한 줄로 읽는 화면(상세·글)·시트의 틀 — 넓은 화면에서 가운데 600 을 넘지 않는다(web 모바일 틀과 같은 폭). */
export const readingColumn = {
  width: '100%',
  maxWidth: layout.wide.readingMaxWidth,
  alignSelf: 'center',
} as const;
