/**
 * 질의에서 상품 토큰만 뽑아낸다.
 *
 * 왜 필요한가: 게이트(`isPolluted`)는 `title.indexOf(keyword)` 로 판정하므로
 * keyword 가 문장이면 어떤 제목도 매칭되지 않아 **오염 판정이 조용히 무효화**된다.
 * 실측(2026-08-07): '콜라' → PARTIAL(가격 주장 안 함) / '콜라 요즘 얼마' → ANSWERED
 * "8,650원부터" (콜라겐·콜라보가 섞인 값). 예시 뱃지가 전부 문장형이라
 * 첫 사용자가 밟는 기본 경로가 다 구멍이었다.
 *
 * 표시는 원문을 유지하고, 검색·게이트만 이 토큰을 쓴다.
 */

/** 의도어 — 상품이 아니라 "무엇을 묻는지"를 나타내는 말. 제목에는 안 나온다. */
const INTENT_WORDS = [
  '요즘',
  '지금',
  '현재',
  '얼마',
  '얼마야',
  '얼마임',
  '얼마나',
  '시세',
  '최저가',
  '최저',
  '가격',
  '값',
  '추천',
  '추천해줘',
  '알려줘',
  '찾아줘',
  '보여줘',
  '핫딜',
  '딜',
  '할인',
  '특가',
  '싼',
  '싼거',
  '싸게',
  '싼가',
  '싼가요',
  '비싼가',
  '살만한',
  '살만해',
  '사도',
  '사도돼',
  '어때',
  '어떤',
  '뭐가',
  '언제',
  '이하',
  '이상',
  '정도',
];

/** 조사 — 토큰 끝에 붙어 매칭을 방해한다. 짧은 것부터 지우면 안 되므로 길이 역순. */
const PARTICLES = [
  '에서는',
  '으로는',
  '이라도',
  '까지',
  '부터',
  '에서',
  '으로',
  '보다',
  '이나',
  '나',
  '은',
  '는',
  '이',
  '가',
  '을',
  '를',
  '의',
  '도',
  '만',
  '로',
];

const stripParticle = (token: string): string => {
  for (const p of PARTICLES) {
    if (token.length > p.length + 1 && token.endsWith(p)) return token.slice(0, -p.length);
  }
  return token;
};

/**
 * 검색·게이트에 쓸 상품 토큰. 못 뽑으면 원문을 그대로 돌려준다
 * (게이트가 무효화되는 것보다 낫다 — 최소한 단일 토큰 질의처럼 동작한다).
 */
export const extractProductTerm = (raw: string): string => {
  const cleaned = raw
    .replace(/[?!.,~]/g, ' ')
    // 가격 표현("10만원 이하")은 상품명이 아니다
    .replace(/\d+\s*(만원|천원|원|만)/g, ' ')
    .trim();

  const kept = cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map(stripParticle)
    .filter((t) => t.length > 0 && !INTENT_WORDS.includes(t));

  return kept.length > 0 ? kept.join(' ') : cleaned || raw.trim();
};
