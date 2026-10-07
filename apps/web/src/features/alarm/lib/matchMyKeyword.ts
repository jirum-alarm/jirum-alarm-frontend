/** 서버는 키워드를 소문자로 저장한다 — 비교도 소문자·앞뒤 공백 없이. */
export const normalizeKeyword = (keyword: string) => keyword.trim().toLowerCase();

/**
 * 알림의 keyword 칸에서 그걸 보낸 **내 키워드**(정규화)를 찾는다. 없으면 undefined.
 * 칸은 키워드 그대로("햇반")이거나 가격 하락 문구("햇반 평소보다 54% 싸게 떴어요 📉")이고,
 * 관심사 알림은 묶음 제목("🥤 [생수·음료 쟁이기] 펩시 핫딜")이라 안 맞는다(2026-10-07 운영 실측).
 * 키워드에 공백이 있을 수 있어("에어팟 프로") 첫 낱말이 아니라 "내 키워드 + 공백" 접두로 보고, 가장 긴 것을 고른다.
 * 앱 `features/keyword-prompt/model/myKeywords.ts` matchMyKeyword 와 같은 규칙.
 */
export function matchMyKeyword(
  notificationKeyword: string | null | undefined,
  mine: Set<string>,
): string | undefined {
  const k = normalizeKeyword(notificationKeyword ?? '');
  let best: string | undefined;
  for (const m of mine) {
    if ((k === m || k.startsWith(`${m} `)) && m.length > (best?.length ?? 0)) {
      best = m;
    }
  }
  return best;
}
