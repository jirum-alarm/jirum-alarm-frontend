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
  [tabStackNavigations.SEARCH]: undefined;
  [tabStackNavigations.WEBVIEW]: {uri: string; title?: string};
};

/** 검색 한 판 + 그 검색에서 연 상세. */
export type SearchStackParamList = ProductFlowParamList & {
  [searchStackNavigations.HOME]: undefined;
};
