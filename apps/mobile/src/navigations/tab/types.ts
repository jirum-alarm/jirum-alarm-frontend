import type {
  searchStackNavigations,
  tabStackNavigations,
} from '@/shared/constant/navigations';

/** 상세·댓글. 탭 스택과 검색 스택이 같은 화면을 쓴다. */
export type ProductFlowParamList = {
  [tabStackNavigations.DETAIL]: {path: string};
  [tabStackNavigations.COMMENTS]: {productId: number};
};

/**
 * 각 탭 안쪽 스택. 탭 루트(웹뷰) 위에 상세를 push 한다.
 * 검색은 중첩 스택이라, 상세와 검색이 한 줄로 섞이지 않는다.
 */
export type TabStackParamList = ProductFlowParamList & {
  [tabStackNavigations.ROOT]: undefined;
  [tabStackNavigations.SEARCH]: {keyword?: string} | undefined;
  [tabStackNavigations.CURATION]: {sectionId: string; title?: string};
  [tabStackNavigations.TOSS_CURATION]: {sectionId?: string};
  [tabStackNavigations.WEBVIEW]: {uri: string; title?: string};

  // 내정보 — 대부분 파라미터가 없다(넓고 얕은 설정 화면들).
  [tabStackNavigations.MYPAGE_ACCOUNT]: undefined;
  [tabStackNavigations.MYPAGE_NICKNAME]: undefined;
  [tabStackNavigations.MYPAGE_PASSWORD]: undefined;
  [tabStackNavigations.MYPAGE_PERSONAL]: undefined;
  [tabStackNavigations.MYPAGE_CATEGORIES]: undefined;
  [tabStackNavigations.MYPAGE_KEYWORD]: undefined;
  [tabStackNavigations.MYPAGE_TERMS]: undefined;
  [tabStackNavigations.POLICY]: {kind: 'privacy' | 'terms'};
  [tabStackNavigations.LIKE]: undefined;
  [tabStackNavigations.THEMES]: undefined;
  [tabStackNavigations.THEME_DETAIL]: {themeId: string; title?: string};

  // 커뮤니티
  [tabStackNavigations.COMMUNITY_POST]: {postId: number};
  /** postId 가 있으면 수정, 없으면 새 글. */
  [tabStackNavigations.COMMUNITY_WRITE]: {postId?: number};
};

/** 검색 한 판 + 그 검색에서 연 상세. */
export type SearchStackParamList = ProductFlowParamList & {
  /** 딥링크(`/search?keyword=…`)로 들어오면 검색어를 들고 시작한다. */
  [searchStackNavigations.HOME]: {keyword?: string} | undefined;
};
