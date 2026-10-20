/**
 * 커뮤니티 — 신고 사유(순서·문구·서버 값)와 web·앱이 똑같이 띄우는 문구. 같은 글을 웹·앱에서 신고할 때 선택지가 다르면
 * 유저는 버그로 읽는다. 전엔 두 앱이 따로 들고 앱 테스트가 web 신고 창 소스를 정규식으로 파싱해 대조했다(2026-10-20 정본화).
 * value 는 서버 enum(UserReportReason) 값 그대로 — 앱마다 codegen 이 따로라 문자열로 적는다.
 */
export const REPORT_REASON_OPTIONS = [
  { label: '불법 정보', value: 'ABUSE' },
  { label: '스팸', value: 'SPAM' },
  { label: '욕설 / 혐오 표현', value: 'INAPPROPRIATE' },
  { label: '개인정보 침해', value: 'PRIVACY' },
  { label: '기타', value: 'OTHER' },
] as const;

export const COMMUNITY_COPY = {
  commentDeleted: '댓글이 삭제되었어요.',
} as const;
