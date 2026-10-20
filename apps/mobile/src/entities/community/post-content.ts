/**
 * 커뮤니티 글 본문의 이미지 마커 파싱 — 정본 @jirum/domain/community-post(web 과 같은 코드).
 * 저장 포맷이 곧 계약이라 한 곳에서만 고친다. 앱은 읽기만 하지만 왕복(직렬화 → 파싱) 테스트로 포맷을 못박는다.
 */
export {
  getPostDisplayContent,
  getPostImages,
  isAllowedPostImageUrl,
  MAX_POST_IMAGES,
  parsePostContent,
  serializePostContent,
} from '@jirum/domain/community-post';
