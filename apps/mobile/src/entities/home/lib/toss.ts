/**
 * 토스 딜 변환·키워드·제목 정리 — 정본 @jirum/domain/toss(web 과 같은 코드).
 * 상품의 `data.toss` 확장정보를 카드가 쓸 모양으로 정규화한다.
 */
export {
  isPriceGuideTitle,
  stripPriceFromTitle,
  TOSS_HOME_SECTION_IDS,
  TOSS_SECTION_KEYWORD,
  toTossDeal,
  tossDetailPath,
  type TossDeal,
} from '@jirum/domain/toss';

export function isFromTossPath(path: string): boolean {
  return /[?&]from=toss(?:&|$)/.test(path);
}
