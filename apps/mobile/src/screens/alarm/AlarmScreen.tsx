import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, FlatList, RefreshControl, View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import {useNavigation} from '@react-navigation/native';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {NotificationQueries} from '@/entities/notification';
import PressableScale from '@/shared/components/PressableScale';
import ConfirmSheet from '@/shared/components/ConfirmSheet';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import {usePullRefresh} from '@/shared/hooks/usePullRefresh';
import TrashBin from '@/shared/components/icons/TrashBin';
import {
  tabNavigations,
  tabStackNavigations,
} from '@/shared/constant/navigations';
import {useRegisterScrollToTop} from '@/navigations/tab/scroll-to-top-store';
import {getReservedBottomPx} from '@/navigations/tab/tab-bar-metrics';
import {
  getLastAlarmReadAt,
  setLastAlarmReadAt,
} from '@/shared/lib/alarm-read-state';
import type {NotificationItem} from '@/shared/api/notification';
import {Analytics} from '@/shared/lib/analytics/ga4';

import {useNotificationsViewModel} from './model/useNotificationsViewModel';
import AlarmItem from './ui/AlarmItem';
import NoAlerts from './ui/NoAlerts';
import {ListRowsSkeleton} from '@/shared/components/Skeletons';
import {showToast} from '@/shared/lib/feedback';
import {refetchFirstPage} from '@/shared/lib/client/refetch-first-page';
import {usePushPermissionStatus} from '@/shared/lib/fcm/usePushPermissionStatus';

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
  const [confirmRemoveAll, setConfirmRemoveAll] = useState(false);

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
      // 알림 목록 클릭 추적 — web features/alarm/ui/AlarmItem 과 같은 파라미터.
      // 푸시 클릭(FCMHandler)은 같은 이벤트에 url·state 가 더 붙는다 — state 가
      // 없는 app 행이 목록 클릭이다. 상품이 없는 알림도 web 처럼 보낸다(target_id 만 빠짐).
      Analytics.track('notification_clicked', {
        target: 'product',
        target_id: notification.product?.id,
        platform: 'app',
      });
      const markRead = () => {
        if (!notification.readAt) onReadNotification(Number(notification.id));
      };
      // 상품이 삭제/비공개면 읽음만 찍고 이동하지 않는다(web hasProduct 분기).
      // 예전엔 아무 반응이 없어 고장 난 것처럼 보였다 — 이유를 알려준다.
      if (productId == null) {
        markRead();
        showToast.info('판매가 끝났거나 내려간 딜이에요.');
        return;
      }
      // ★push 먼저 — 읽음 처리(낙관적 갱신)가 목록 전체를 다시 그리는 걸 전환과 같은
      // 틱에 하면 상세가 한 박자 늦게 떴다. 전환이 시작된 뒤로 미룬다.
      navigation.push(tabStackNavigations.DETAIL, {
        path: `/products/${productId}`,
      });
      setTimeout(markRead, 350);
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

  const renderItem = useCallback(
    ({item}: {item: NotificationItem}) => (
      <AlarmItem
        notification={item}
        isNew={new Date(item.createdAt).getTime() > lastReadAt && !item.readAt}
        isEditMode={isEditMode}
        onPress={handlePressItem}
        onDelete={onRemoveNotification}
      />
    ),
    [lastReadAt, isEditMode, handlePressItem, onRemoveNotification],
  );

  const push = usePushPermissionStatus();

  // 당기면 첫 페이지부터 — 깊이 내린 뒤 당기면 페이지 수만큼 왕복을 차례로 기다렸다.
  const queryClient = useQueryClient();
  const pullRefresh = useCallback(
    () =>
      refetchFirstPage(
        queryClient,
        NotificationQueries.infiniteNotifications().queryKey,
      ),
    [queryClient],
  );
  const {refreshing, onRefresh} = usePullRefresh(pullRefresh);

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
              hitSlop={8}
              onPress={() => setConfirmRemoveAll(true)}>
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
            {/* 권한이 꺼져 있으면 무엇보다 그게 먼저다 — 키워드를 등록해도 알림이 안 온다. */}
            {push.granted === false ? (
              <>
                <Text className="text-sm font-medium text-gray-700">
                  알림이 꺼져 있어 핫딜을 못 받고 있어요
                </Text>
                <PressableScale
                  accessibilityRole="button"
                  accessibilityLabel="알림 켜기"
                  className="h-8 justify-center rounded-md bg-gray-800 px-3"
                  onPress={push.enable}>
                  <Text className="text-sm font-semibold text-primary-500">
                    켜기
                  </Text>
                </PressableScale>
              </>
            ) : (
              <>
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
              </>
            )}
          </View>
        )}
      </View>

      {isError && !notifications?.length ? (
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
          // 탭바가 화면 위에 떠 있어 마지막 행이 가려진다(다른 탭 목록과 같게).
          contentContainerStyle={{
            paddingBottom: getReservedBottomPx(insets.bottom),
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
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
          renderItem={renderItem}
        />
      )}
      {/* 한 번 탭으로 전부 지우지 않는다 — 되돌릴 수 없다. */}
      <ConfirmSheet
        visible={confirmRemoveAll}
        title="알림을 모두 삭제할까요?"
        description="삭제한 알림은 다시 볼 수 없어요."
        confirmLabel="전체 삭제"
        tone="danger"
        onCancel={() => setConfirmRemoveAll(false)}
        onConfirm={() => {
          setConfirmRemoveAll(false);
          onRemoveAll();
          setEditMode(false);
        }}
      />
    </View>
  );
}
