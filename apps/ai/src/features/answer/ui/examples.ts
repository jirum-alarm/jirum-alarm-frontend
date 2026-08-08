export const EXAMPLES = ['콜라 요즘 얼마', '라면 시세', '기저귀 최저가', '무선이어폰', '생수'];

/**
 * 질의를 **새 대화** 경로로.
 *
 * ★`/c/new?q=` 를 쓰는 이유: 대화 id 는 chat 서버가 첫 응답에서 발급한다.
 * 홈에서 미리 만들려면 질문 전에 세션을 만들어야 하고, 그러면 유저가 이탈했을 때
 * 빈 대화가 쌓인다. 그래서 "질문을 들고 빈 방에 들어가서 거기서 발급받는다" —
 * 방 안에서 `history.replaceState` 로 `/c/<id>` 가 된다(Chat.tsx).
 *
 * `new` 는 예약어라 `/c/[conversationId]` 와 충돌하지 않는다(Next 는 정적 세그먼트 우선).
 */
export const roomHref = (question: string) => `/c/new?q=${encodeURIComponent(question)}`;
