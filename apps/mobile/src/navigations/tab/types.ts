import type {
  mainNavigations,
  searchStackNavigations,
  tabStackNavigations,
} from '@/shared/constant/navigations';

/** 상세·댓글. 탭 스택과 검색 스택이 같은 화면을 쓴다. */
export type ProductFlowParamList = {
  [tabStackNavigations.DETAIL]: {path: string};
  [tabStackNavigations.COMMENTS]: {productId: number};
};

/**
 * 앱 화면 목록. **탭 루트(ROOT)만 각 탭 스택**에 있고, 나머지는 전부 탭 **바깥** 루트 스택
 * (MainNavigator)에 있다 — 상세 등이 탭바째 덮으므로 탭바를 숨기고 되살리는 코드가 없다.
 * 화면은 탭 스택에서 push 해도 이름이 없으니 루트 스택으로 올라가 처리된다.
 * 한 목록으로 두는 이유: 화면 props 타입이 어느 스택에 등록되든 같게.
 * 검색은 중첩 스택이라, 상세와 검색이 한 줄로 섞이지 않는다.
 */
export type TabStackParamList = ProductFlowParamList & {
  [mainNavigations.TABS]: undefined;
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
  /** focus: 펼쳐서 맨 위에 둘 키워드(알림 한 줄의 키워드 라벨에서 들어올 때). */
  [tabStackNavigations.MYPAGE_KEYWORD]: {focus?: string} | undefined;
  [tabStackNavigations.MYPAGE_NOTIFICATION]: undefined;
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
  /**
   * keyword: 딥링크(`/search?keyword=…`)로 들어오면 검색어를 들고 시작한다.
   * focusAt: 이미 열린 검색 화면으로 돌아올 때 입력창을 포커스하라는 신호(값이 바뀔 때마다).
   */
  [searchStackNavigations.HOME]:
    | {keyword?: string; focusAt?: number}
    | undefined;
};
