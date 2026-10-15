import React, {useEffect, useLayoutEffect, useState} from 'react';
import {Alert} from 'react-native';
import {usePreventRemove} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQueryClient} from '@tanstack/react-query';

import {CommunityQueries} from '@/entities/community';
import type {TabStackParamList} from '@/navigations/tab/types';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {StackWebView} from '@/screens/detail/ProductDetailWebViewScreen';

type Props = NativeStackScreenProps<
  TabStackParamList,
  typeof tabStackNavigations.COMMUNITY_WRITE
>;

/**
 * 글쓰기·글수정. **네이티브 껍데기 + web 본문(웹뷰)** 이다.
 *
 * 🔴 왜 여기만 네이티브가 아닌가 (2026-09-07 결정):
 *  1. **이미지 피커가 이 레포에 없다** — `expo-image-picker` ·
 *     `react-native-image-picker` 둘 다 미설치라 새로 넣으면 네이티브 재빌드가
 *     필요하다(OTA 로 못 내린다).
 *  2. **본문 마커 바이트 호환** — 첨부 이미지는 본문 문자열 안
 *     `:::jirum-images` 블록으로 저장된다(`entities/community/post-content`).
 *     쓰기를 두 벌로 만들면 포맷이 어긋나는 순간 **이미 올라간 글이 깨진다.**
 *     쓰기 경로를 web 하나로 두면 그 위험이 원천적으로 없다.
 *  3. 상품 태그 모달의 "최근 본 상품"은 웹뷰 localStorage 를 읽는다
 *     (`ProductDetailScreen` 이 상세를 볼 때마다 심어준다). 네이티브로 옮기면
 *     그 연결도 다시 만들어야 한다.
 *
 * 선례는 `screens/detail/SearchScreen`(StackWebView + path). 껍데기가
 * 네이티브라 헤더·뒤로가기·탭바 정책은 네이티브 규칙을 따른다.
 *
 * ★네이티브 헤더를 띄우지 않는다 — web 글쓰기 페이지의 헤더에 **올리기/수정
 * 완료 버튼**이 들어 있다(`form=POST_FORM_ID` 로 submit 한다). 네이티브
 * 헤더를 얹으면 헤더가 두 겹이 되고, 네이티브에서는 그 폼을 submit 할 수 없다.
 *
 * ★뒤로가기: `StackWebView` 가 `NATIVE_STACK_SCRIPT` 를 주입하고
 * `PRESS_BACKBUTTON` 을 **자기가 가로채** goBack 한다(그 파일 handleMessage).
 * 주입만 있고 가로채기가 없으면 전역 `EventBridge.pressBackButton` 이 받아
 * `BackHandler.exitApp()` = 앱 종료가 된다 — 짝이 맞는지 확인했다.
 */
export default function CommunityWriteScreen({route, navigation}: Props) {
  const postId = route.params?.postId;
  const queryClient = useQueryClient();

  useLayoutEffect(() => {
    navigation.setOptions({headerShown: false});
  }, [navigation]);

  /**
   * ★웹이 대신 해주던 일의 인수 — **캐시 무효화**.
   *
   * 글을 올리거나 고치면 web 은 자기 react-query 캐시를 무효화한다. 그 캐시는
   * 웹뷰 안에만 있어서, 네이티브 목록·상세는 예전 데이터를 그대로 들고 있다
   * (= 올린 글이 목록에 안 보인다 · 수정한 글이 옛 내용으로 남는다).
   * 이 화면을 떠날 때 커뮤니티 캐시를 통째로 버려서 다음 렌더에 다시 받는다.
   *
   * ponytail: "성공했는지"를 웹뷰에서 알아낼 방법이 없으므로(브릿지에 그런
   * 이벤트가 없다) 취소로 나가는 경우까지 포함해 무조건 무효화한다 —
   * 목록 한 번 더 받는 비용이 안 보이는 글보다 싸다.
   */
  useEffect(() => {
    return () => {
      queryClient.invalidateQueries({queryKey: CommunityQueries.keys.all});
    };
  }, [queryClient]);

  /**
   * 쓰던 내용이 있으면 나가기 전에 묻는다. 예전엔 스와이프·안드로이드 뒤로·웹 헤더 뒤로 한 번에 초안이 말없이 사라졌다.
   * 「쓰던 내용 있음」은 web 폼(usePostForm)이 WRITE_DRAFT_CHANGED 로 알린다 — 올리기에 성공하면 false 를 먼저 보내고
   * 닫으므로 그때는 묻지 않는다. usePreventRemove 는 막는 동안 iOS 스와이프 제스처도 꺼 준다.
   */
  const [hasDraft, setHasDraft] = useState(false);
  usePreventRemove(hasDraft, ({data}) => {
    Alert.alert('작성 중인 글이 있어요', '나가면 쓰던 내용이 사라져요.', [
      {text: '계속 쓰기', style: 'cancel'},
      {
        text: '나가기',
        style: 'destructive',
        onPress: () => navigation.dispatch(data.action),
      },
    ]);
  });

  return (
    <StackWebView
      onDraftChange={setHasDraft}
      // web 은 수정을 `?edit=<id>` 쿼리로 받는다(라우트가 아니다).
      path={postId ? `/community/write?edit=${postId}` : '/community/write'}
      navigation={navigation}
      hideWebNav
    />
  );
}
