import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {NotificationQueries} from '@/entities/notification';
import PressableScale from '@/shared/components/PressableScale';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import TrashBin from '@/shared/components/icons/TrashBin';
import {
  tabNavigations,
  tabStackNavigations,
} from '@/shared/constant/navigations';
import {useRegisterScrollToTop} from '@/navigations/tab/scroll-to-top-store';
import {
  getLastAlarmReadAt,
  setLastAlarmReadAt,
} from '@/shared/lib/alarm-read-state';
import type {NotificationItem} from '@/shared/api/notification';

import {useNotificationsViewModel} from './model/useNotificationsViewModel';
import AlarmItem from './ui/AlarmItem';
import NoAlerts from './ui/NoAlerts';
import {ListRowsSkeleton} from '@/shared/components/Skeletons';

/** web PageHeader 와 같은 높이(h-14)·색·경계선. */
const HEADER_HEIGHT = 56;

type Navigation = {
  push: (name: string, params?: object) => void;
};

/**
 * 알림 탭 루트. web `/alarm`(BasicLayout + PageHeader + AlarmContainer) 대응.
 *
 * ★web 의 분기 2개는 여기 없다 —
 *   - `AppDownloadGuide`: 앱에서는 isJirumAlarmApp 이 항상 참이라 안 탄다
 *   - `LoginGuide`: RootNavigator 가 비로그인을 AuthNavigator 로 보내므로
 *     이 화면 자체에 도달하지 않는다
 * 둘을 옮기면 영원히 안 뜨는 코드가 된다.
 */
export default function AlarmScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Navigation>();
  const {
    notifications,
    isPending,
    isError,
    refetch,
    noData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    onReadNotification,
    onRemoveNotification,
    onRemoveAll,
  } = useNotificationsViewModel();

  const [isEditMode, setEditMode] = useState(false);

  /**
   * 알림 탭 재탭 → 목록 맨 위로. (웹뷰 시절 injectJavaScript 를 대체)
   *
   * 리스트는 에러·로딩·빈 목록 분기에선 렌더되지 않으므로 ref 가 비어 있을 수
   * 있다 — 그때는 올릴 것도 없으니 optional chaining 으로 흘려보낸다.
   */
  const listRef = useRef<FlatList>(null);
  const scrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({offset: 0, animated: true});
  }, []);
  useRegisterScrollToTop(tabNavigations.ALARM, scrollToTop);

  // 편집 버튼 노출 판단(web AlarmHeaderActions: 알림이 1건이라도 있어야 뜬다).
  const {data: existsAny} = useQuery(NotificationQueries.existsAny());

  /**
   * "새 알림" 강조 기준선. web 은 렌더 중 동기로 읽지만 AsyncStorage 는
   * 비동기라 첫 프레임엔 0(강조 없음)으로 두고 도착하면 다시 그린다.
   * 화면을 열자마자 기준선을 갱신하는 순서까지 web(useEffect)과 같다.
   */
  const [lastReadAt, setLastReadAt] = useState(0);
  useEffect(() => {
    let alive = true;
    getLastAlarmReadAt().then(value => {
      if (alive) setLastReadAt(value);
      return setLastAlarmReadAt();
    });
    return () => {
      alive = false;
    };
  }, []);

  const handlePressItem = useCallback(
    (notification: NotificationItem, productId: number | null) => {
      if (!notification.readAt) {
        onReadNotification(Number(notification.id));
      }
      // 상품이 삭제/비공개면 읽음만 찍고 이동하지 않는다(web hasProduct 분기).
      if (productId == null) return;
      navigation.push(tabStackNavigations.DETAIL, {
        path: `/products/${productId}`,
      });
    },
    [navigation, onReadNotification],
  );

  const goKeywordSettings = useCallback(() => {
    // ★2026-09-08 로 키워드 관리가 네이티브 화면이 됐다(내정보 탭 소속).
    // 예전처럼 web 을 웹뷰로 띄우면 **같은 화면이 두 벌**이 되고, 그 web 버전은
    // 이제부터 낡는다. 라우트는 모든 탭 스택에 등록돼 있어 알림 탭 안에 쌓인다.
    navigation.push(tabStackNavigations.MYPAGE_KEYWORD);
  }, [navigation]);

  const showEditButton = !!existsAny && !isEditMode;

  return (
    <View className="flex-1 bg-white" style={{paddingTop: insets.top}}>
      {/* 헤더 — web PageHeader(title="알림", actions=휴지통) */}
      <View
        className="flex-row items-center justify-between border-b border-gray-100 bg-white px-5"
        style={{height: HEADER_HEIGHT}}>
        <Text className="text-lg font-semibold text-gray-900">알림</Text>
        {showEditButton ? (
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="알림 편집"
            hitSlop={8}
            onPress={() => setEditMode(true)}>
            <TrashBin />
          </PressableScale>
        ) : null}
      </View>

      {/* 안내 줄 — web AlarmList 의 sticky 바. 편집모드면 전체삭제/완료로 갈린다. */}
      <View className="border-b border-gray-200 bg-gray-50">
        {isEditMode ? (
          <View className="h-11 flex-row items-center justify-end gap-x-3 px-5">
            <PressableScale
              accessibilityRole="button"
              onPress={() => {
                onRemoveAll();
                setEditMode(false);
              }}>
              <Text className="px-1 text-sm font-medium text-gray-600">
                전체 삭제
              </Text>
            </PressableScale>
            <PressableScale
              accessibilityRole="button"
              className="h-8 justify-center rounded-md border border-gray-300 bg-white px-3"
              onPress={() => setEditMode(false)}>
              <Text className="text-sm font-medium text-gray-900">완료</Text>
            </PressableScale>
          </View>
        ) : (
          <View className="h-11 flex-row items-center justify-between px-5">
            <Text className="text-sm font-medium text-gray-600">
              지금 다양한 핫딜 알림을 받아보세요!
            </Text>
            <PressableScale
              accessibilityRole="button"
              className="h-8 justify-center rounded-md border border-gray-300 bg-white px-3"
              onPress={goKeywordSettings}>
              <Text className="text-sm font-medium text-gray-900">
                키워드 알림
              </Text>
            </PressableScale>
          </View>
        )}
      </View>

      {isError ? (
        <SectionErrorRow label="알림" onRetry={refetch} />
      ) : isPending ? (
        // 빈 화면 + 점 하나 대신 알림 행 골격을 그린다.
        <ListRowsSkeleton count={7} />
      ) : noData ? (
        <NoAlerts onPressKeyword={goKeywordSettings} />
      ) : (
        <FlatList
          ref={listRef}
          data={notifications}
          keyExtractor={item => String(item.id)}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refetch}
              tintColor="#667085"
            />
          }
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="h-12 items-center justify-center">
                <ActivityIndicator size="small" color="#667085" />
              </View>
            ) : null
          }
          renderItem={({item}) => (
            <AlarmItem
              notification={item}
              isNew={
                new Date(item.createdAt).getTime() > lastReadAt && !item.readAt
              }
              isEditMode={isEditMode}
              onPress={productId => handlePressItem(item, productId)}
              onDelete={onRemoveNotification}
            />
          )}
        />
      )}
    </View>
  );
}
