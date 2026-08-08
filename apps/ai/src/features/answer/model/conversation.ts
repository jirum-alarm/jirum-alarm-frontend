import type { AnswerBlock } from './answer';

/**
 * 저장된 대화. chat 서버 `GET /conversations/:id` 응답 모양.
 *
 * 정본은 서버(`jirum-alarm-chat/src/contract/answer-block.ts` 의 `Turn`)다.
 */
export type StoredTurn =
  | { role: 'user'; text: string; at: string }
  | { role: 'assistant'; blocks: AnswerBlock[]; at: string };

export type StoredConversation = { id: string; title: string; turns: StoredTurn[] };

/**
 * chat 서버 주소. **서버에서만 읽는다** — 브라우저는 항상 같은 오리진의
 * `/api/ask` 프록시를 통하므로 이 값이 클라이언트로 새면 안 된다(NEXT_PUBLIC_ 금지).
 */
export const CHAT_API = process.env.CHAT_API_URL || 'http://127.0.0.1:3400';

/**
 * 저장된 대화 조회. 없거나 남의 것이면 null —
 * 페이지가 404 로 갈지 빈 방을 보여줄지는 호출부가 정한다.
 *
 * 쿠키를 그대로 넘긴다: 서버가 소유권(userId)을 확인해야 하기 때문.
 */
export const fetchConversation = async (
  id: string,
  cookie: string,
): Promise<StoredConversation | null> => {
  try {
    const res = await fetch(`${CHAT_API}/conversations/${encodeURIComponent(id)}`, {
      headers: { cookie },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as StoredConversation;
  } catch (e) {
    console.error('[ai] fetchConversation failed:', e);
    return null;
  }
};
