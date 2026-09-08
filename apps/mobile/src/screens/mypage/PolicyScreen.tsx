import React from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {TabStackParamList} from '@/navigations/tab/types';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {StackWebView} from '@/screens/detail/ProductDetailWebViewScreen';

type Props = NativeStackScreenProps<
  TabStackParamList,
  typeof tabStackNavigations.POLICY
>;

/**
 * 이용약관 · 개인정보 처리방침. **껍데기만 네이티브, 본문은 web 페이지다.**
 *
 * ★왜 안 옮겼나 — 본문이 `apps/web/src/shared/config/policy.ts` 에 479줄로
 * 들어 있는 **법무 문서**다. 복사해 오면 web 이 약관을 고쳐도 앱은 스토어
 * 릴리스(또는 OTA)까지 옛 문서를 보여준다 — 법적으로 위험한 종류의 drift 다.
 * 두 페이지는 이미 공개·색인되는 web 라우트라(robots index:true) 웹뷰로 여는
 * 게 정본을 하나로 유지하는 유일한 방법이다.
 * 선례: `SearchScreen` 이 같은 방식으로 `/search` 를 띄운다.
 *
 * ★네이티브 헤더를 얹지 않는다 — web `TermsLayout` 이 자체 헤더(오른쪽 X)를
 * 갖고 있어 두 겹이 된다. 그 X 는 `useGoBack` → `PRESS_BACKBUTTON` 브릿지를
 * 타고, `StackWebView` 가 이미 `goBack()` 한다.
 * ⚠️**여기서 pop 을 또 하지 말 것** — 두 번 pop 되어 탭 밖으로 튄다(런북).
 */
export default function PolicyScreen({route, navigation}: Props) {
  const path =
    route.params.kind === 'privacy' ? '/policies/privacy' : '/policies/terms';

  return (
    <StackWebView
      path={path}
      navigation={navigation}
      // 이 라우트는 `hidesTabBar` 목록에 있다(내비게이터가 라우트로 판단).
      // 여기서도 켜 두면 iOS 26 clip 몫 패딩이 같이 걸린다.
      hideTabBar
      // 웹 하단바는 항상 숨긴다 — 네이티브 탭바와 두 겹이 된다.
      hideWebNav
    />
  );
}
