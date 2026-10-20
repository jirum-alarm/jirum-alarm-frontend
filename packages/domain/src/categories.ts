/**
 * 관심 카테고리 — 고르는 화면(web 마이페이지·앱 관심 카테고리)의 id·이름·순서. web·앱이 같이 쓴다.
 *
 * 서버에 보내는 값이 id 라서 하나만 어긋나도 엉뚱한 카테고리가 저장된다. 순서는 3열 격자의 «그 자리»다.
 * 그림은 플랫폼마다(web 은 이모지·카테고리 아이콘, 앱은 라인 아이콘 CATEGORY_ICON).
 * 전엔 두 앱이 표를 따로 들고 앱 테스트가 web 설정 파일을 정규식으로 파싱해 대조했다(2026-10-20 정본화).
 */
export const INTEREST_CATEGORIES = [
  { value: 1, text: '컴퓨터', emoji: '💻' },
  { value: 2, text: '생활/식품', emoji: '🛒' },
  { value: 3, text: '화장품', emoji: '💄' },
  { value: 5, text: '도서', emoji: '📗' },
  { value: 6, text: '가전/가구', emoji: '🛏' },
  { value: 7, text: '등산/레저', emoji: '🧗‍♀️' },
  { value: 9, text: '디지털', emoji: '🎮' },
  { value: 10, text: '육아', emoji: '🍼' },
  { value: 8, text: '상품권', emoji: '💸' },
  { value: 4, text: '의류/잡화', emoji: '👕' },
  { value: 12, text: '반려동물', emoji: '🐶' },
  { value: 11, text: '기타', emoji: '🔍' },
] as const;

export type InterestCategoryId = (typeof INTEREST_CATEGORIES)[number]['value'];

/** 한 번에 고를 수 있는 관심 카테고리 수. */
export const MAX_INTEREST_CATEGORIES = 5;
