import {Analytics} from './ga4';

/**
 * 키워드 알림 등록 — 서비스의 핵심 행동이라 어디서 등록했는지까지 남긴다.
 * web `features/mypage/model/update-keyword.ts` 와 같은 이름·값(GA4 에서 합쳐 본다).
 * 되돌리기(삭제 취소)로 다시 거는 건 새 등록이 아니라 보내지 않는다.
 */
export type KeywordRegisterSource =
  | 'mypage' // 내정보 > 키워드 직접 입력
  | 'mypage_recommend' // 내정보 > 키워드 추천 칩
  | 'home_recommend' // 홈 추천 키워드
  | 'post_purchase' // 상세 구매 후 권유 카드
  | 'search_bar' // 검색 결과 위 한 줄
  | 'search_no_result'; // 검색 결과 없음 버튼

export function trackKeywordRegister(
  source: KeywordRegisterSource,
  keyword: string,
): void {
  Analytics.track('keyword_register', {source, keyword});
}
