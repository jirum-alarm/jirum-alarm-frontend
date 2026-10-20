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

/** 커뮤니티 목록 탭 — 순서·라벨. */
export type CommunityTab = 'all' | 'trending' | 'notice';
export const COMMUNITY_TABS: readonly { label: string; value: CommunityTab }[] = [
  { label: '전체', value: 'all' },
  { label: '인기', value: 'trending' },
  { label: '공지', value: 'notice' },
];

/** 탭 → 목록 쿼리 필터. 「전체」는 필터를 아예 안 보낸다. */
export function communityTabFilter(tab: CommunityTab): {
  isNotice?: boolean;
  isTrending?: boolean;
} {
  if (tab === 'notice') return { isNotice: true };
  if (tab === 'trending') return { isTrending: true };
  return {};
}

/** 목록 한 쪽 크기·정렬(서버 enum CommentOrder.ID·OrderOptionType.DESC 값). 어긋나면 같은 커뮤니티가 웹·앱에서 다른 순서. */
export const COMMUNITY_POSTS_PAGE_SIZE = 20;
export const COMMUNITY_POSTS_ORDER = { orderBy: 'ID', orderOption: 'DESC' } as const;

/**
 * 커뮤니티 위 「핫딜」 섹션 후보. 날짜(KST)로 하루 하나를 고르므로 순서가 어긋나면 웹·앱이 같은 날 다른 섹션을 보여 준다.
 * categoryId 는 랭킹 섹션만 쓴다.
 */
export const COMMUNITY_HOT_DEAL_OPTIONS = [
  {
    id: 'hotdeal',
    label: '지금 인기 핫딜',
    type: 'hotdeal',
    categoryId: null,
    link: '/curation/hotdeal',
  },
  {
    id: 'ranking-all',
    label: '전체 랭킹',
    type: 'ranking',
    categoryId: null,
    link: '/trending/ranking',
  },
  {
    id: 'ranking-2',
    label: "'생활·식품' 인기 상품",
    type: 'ranking',
    categoryId: 2,
    link: '/trending/ranking?tab=2',
  },
  {
    id: 'ranking-1',
    label: "'컴퓨터' 인기 상품",
    type: 'ranking',
    categoryId: 1,
    link: '/trending/ranking?tab=1',
  },
] as const;

export type CommunityHotDealOption = (typeof COMMUNITY_HOT_DEAL_OPTIONS)[number];

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * 오늘(KST) 보여 줄 섹션 번호 — 하루 동안 안 바뀐다. 실행 환경 시간대(getDate)를 쓰면 서버(UTC)·브라우저(KST)가
 * 00~09시 KST 에 하루씩 갈려 다른 제목을 그렸다(하이드레이션 오류 #418).
 */
export const dailyHotDealOptionIndex = (date: Date = new Date()): number =>
  new Date(date.getTime() + KST_OFFSET_MS).getUTCDate() % COMMUNITY_HOT_DEAL_OPTIONS.length;
