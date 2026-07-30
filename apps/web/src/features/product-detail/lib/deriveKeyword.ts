/**
 * 상품 제목에서 알림 키워드를 뽑는다. 대괄호 말머리와 괄호 뒷단을 떼어낸 앞부분.
 *
 * 키워드가 길수록 매칭되는 신규 딜이 사라지므로 앞 두 단어까지만 남긴다.
 * (PostPurchaseKeywordPrompt 에서 쓴다. 컴포넌트 파일은 React/Next 를 import 해서
 *  bare node ESM 으로 로드가 안 되므로 순수 함수만 따로 둔다 — 레포의 date.test.ts 참고.)
 */
export function deriveKeyword(title: string): string {
  const cleaned = title
    .replace(/^\[[^\]]*\]\s*/, '') // [지마켓] 같은 말머리 제거
    .split('(')[0]
    .replace(/\s+/g, ' ')
    .trim();

  const words = cleaned.split(' ');
  const keyword = words.length > 2 ? words.slice(0, 2).join(' ') : cleaned;

  return keyword.slice(0, 20).trim();
}
