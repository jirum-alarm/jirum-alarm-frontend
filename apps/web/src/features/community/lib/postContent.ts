// 커뮤니티 글 본문의 이미지 마커 직렬화·파싱 — 정본 @jirum/domain/community-post(앱과 같은 코드, 저장 포맷이 계약).
export {
  ACCEPTED_POST_IMAGE_TYPES,
  getPostDisplayContent,
  getPostImages,
  isAllowedPostImageUrl,
  MAX_POST_IMAGE_BYTES,
  MAX_POST_IMAGES,
  parsePostContent,
  serializePostContent,
} from '@jirum/domain/community-post';
