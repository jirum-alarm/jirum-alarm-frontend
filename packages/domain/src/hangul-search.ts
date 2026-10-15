/**
 * 한글 목록 검색 — 초성·조합 중 글자까지. es-hangul(토스) 위에 이 서비스 쓰임새만 얹는다.
 *
 * ★es-hangul 은 이름 import 만 — 트리셰이킹돼 쓰는 함수만 실린다(전체 7.3KB gz → 1.9KB gz, 2026-10-15 실측).
 * ★고정 문구의 조사(「카카오로」 등)엔 es-hangul `josa` 를 쓰지 말 것 — 값이 몇 개 안 되면 문자열로 적는 게 공짜다.
 *   web 공유 시트에 josa 를 붙였더니 상품 상세 첫 로드 JS 가 +4.8KB gz 였다(2026-10-15 실측, 그래서 걷어냄).
 */
import { canBeChoseong, disassemble, getChoseong } from 'es-hangul';

const compact = (s: string) => s.toLowerCase().replace(/\s+/g, '');

/** "ㅅㄹㅁ" 처럼 초성만 친 입력인가. */
const isChoseongOnly = (q: string) => [...q].every((ch) => canBeChoseong(ch));

/**
 * 목록을 한글 입력으로 거른다 — 띄어쓰기·대소문자 무시.
 *  - 초성만 친 입력("ㅅㄹㅁ")은 초성으로 찾는다 → 신라면.
 *  - 조합 중인 글자("신라며"·"맛바")는 자모로 풀어 찾는다 → 신라면·맛밤. 조합 중엔 마지막 글자가
 *    완성 전이라 글자 단위로 비교하면 한 타마다 「결과 없음」이 깜빡였다.
 * 그대로 들어 있는 것(기존 결과)을 앞에, 자모로만 맞은 것을 뒤에 둔다 — 원래 순서는 각 묶음 안에서 유지.
 * 목록을 한 번 풀어 두고 입력마다 함수만 다시 부른다(1,200개 기준 입력당 1ms 안쪽).
 */
export function createHangulFilter<T>(items: readonly T[], getText: (item: T) => string) {
  const rows = items.map((item) => {
    const text = compact(getText(item));
    return { item, text, jamo: disassemble(text), choseong: getChoseong(text) };
  });

  return (query: string): T[] => {
    const q = compact(query);
    if (!q) return [];
    if (isChoseongOnly(q)) return rows.filter((r) => r.choseong.includes(q)).map((r) => r.item);

    const qJamo = disassemble(q);
    const exact: T[] = [];
    const partial: T[] = [];
    for (const r of rows) {
      if (r.text.includes(q)) exact.push(r.item);
      else if (r.jamo.includes(qJamo)) partial.push(r.item);
    }
    return [...exact, ...partial];
  };
}
