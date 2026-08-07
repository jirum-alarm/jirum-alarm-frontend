export const EXAMPLES = ['콜라 요즘 얼마', '라면 시세', '기저귀 최저가', '무선이어폰', '생수'];

/** 질의를 대화방 경로로. 표시도 URL 도 원문 그대로 쓴다(검색어가 곧 방 이름). */
export const roomHref = (question: string) => `/c/${encodeURIComponent(question)}`;
