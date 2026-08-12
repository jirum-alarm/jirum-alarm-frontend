import type {tabStackNavigations} from '@/shared/constant/navigations';

/**
 * 각 탭 안쪽 스택. 탭 루트(웹뷰) 위에 상세를 push 한다.
 * push 된 화면은 네이티브 전환을 타므로 흰 화면 없이 슬라이드 인 된다.
 */
export type TabStackParamList = {
  [tabStackNavigations.ROOT]: undefined;
  [tabStackNavigations.DETAIL]: {path: string};
  [tabStackNavigations.COMMENTS]: {productId: number};
};
