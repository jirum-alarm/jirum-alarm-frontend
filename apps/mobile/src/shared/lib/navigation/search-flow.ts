import type {ParamListBase} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  searchStackNavigations,
  tabStackNavigations,
} from '@/shared/constant/navigations';

type StackNav = NativeStackNavigationProp<ParamListBase>;

function isInSearchStack(navigation: Pick<StackNav, 'getState'>) {
  return navigation.getState().routeNames.includes(searchStackNavigations.HOME);
}

/**
 * 지금 탭 스택 안인가.
 *
 * 같은 웹뷰 화면이 탭 스택(더보기)과 MainStack 양쪽에서 열릴 수 있어서,
 * 다음 페이지를 어느 라우트로 쌓을지 판단해야 한다. 탭 밖 라우트로 쌓으면
 * 탭바 숨김 정책이 안 걸려 하단 탭바가 다시 뜬다.
 */
export function isInTabStack(navigation: Pick<StackNav, 'getState'>) {
  return navigation.getState().routeNames.includes(tabStackNavigations.WEBVIEW);
}

/**
 * 검색은 탭 스택에 한 번만 올라간다.
 *
 * 상세와 같은 줄에 push 하면 ROOT → 상세 → 검색 → 상세 → 검색 으로 꼬인다.
 * 검색 플로우 안이면 검색 홈으로 돌아가고, 아니면 검색 스택을 연다.
 */
export function openSearch(navigation: StackNav) {
  if (isInSearchStack(navigation)) {
    navigation.navigate(searchStackNavigations.HOME);
    return;
  }
  navigation.push(tabStackNavigations.SEARCH);
}

/**
 * 로고는 탭 홈으로. 검색 스택 안에서 popToTop 하면 검색 홈으로만 가서
 * 원래 보고 있던 탭 루트까지 안 내려간다.
 */
export function goTabHome(navigation: StackNav) {
  if (isInSearchStack(navigation)) {
    (navigation.getParent() as StackNav | undefined)?.popToTop();
    return;
  }
  navigation.popToTop();
}

export {isInSearchStack};
