/**
 * 홈 폴백 섹션 카탈로그·id 찾기 — 정본 @jirum/domain/home-sections.
 * RN 엔 서버 렌더가 없어 탭 목록 두 개(communityProviders/mallGroups)를 클라에서 받아 넘긴다.
 * 두 쿼리가 실패해도 섹션은 나와야 하므로 호출부에서 빈 배열을 넘긴다 → 키워드 기반 폴백 탭이 쓰인다.
 */
export {
  buildFallbackPromotionSections as buildPromotionSections,
  findPromotionSectionById,
  type PromotionTabSources,
} from '@jirum/domain/home-sections';
