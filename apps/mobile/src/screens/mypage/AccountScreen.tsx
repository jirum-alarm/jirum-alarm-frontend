import React, {useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';

import {MyPageQueries} from '@/entities/mypage';
import type {TabStackParamList} from '@/navigations/tab/types';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {useHiddenTabBarClipPadding} from '@/shared/hooks/useHideTabBar';
import ConfirmModal from '@/features/mypage/ui/ConfirmModal';
import {MovePageRow} from '@/features/mypage/ui/Rows';
import StackHeader from '@/features/mypage/ui/StackHeader';
import {useLogout} from '@/features/mypage/model/useLogout';
import {useWithdraw} from '@/features/mypage/model/mutations';

type Props = NativeStackScreenProps<
  TabStackParamList,
  typeof tabStackNavigations.MYPAGE_ACCOUNT
>;

/**
 * 가입 정보. web `/mypage/account`(AccountContainer + AccountManagement).
 *
 * ★web 의 `min-h-[calc(100vh-56px-max(56px,var(--bottom-nav-padding)))]` 주석
 * (버튼이 바텀네비에 가려지던 버그)은 **앱에 옮길 게 없다** — 그 계산은
 * CSS var 가 SSR 에서 0 이라 생긴 문제고, RN 은 `flex-1` + safe area 로 끝난다.
 * 대신 iOS 26 이 탭바를 숨길 때 화면을 잘라 올리므로 그 몫을 비운다
 * (`useHiddenTabBarClipPadding` — 런북의 WEBVIEW 하단 여백 교훈).
 */
export default function AccountScreen({navigation}: Props) {
  const {data: me, isPending, isError, refetch} = useQuery(MyPageQueries.me());
  const bottomClip = useHiddenTabBarClipPadding();

  const logout = useLogout();
  const {mutate: withdraw, isPending: isWithdrawing} = useWithdraw();
  const [dialog, setDialog] = useState<null | 'logout' | 'withdraw'>(null);

  // 동적(safe area·clip) 값만 여기서 합친다. 나머지는 아래 StyleSheet.
  const contentStyle = [styles.content, {paddingBottom: 16 + bottomClip}];

  return (
    <View className="flex-1 bg-white">
      <StackHeader title="가입 정보" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={contentStyle}>
        {isError ? (
          <SectionErrorRow label="내 정보" onRetry={refetch} />
        ) : isPending ? (
          <View className="flex-1 items-center justify-center py-16">
            <ActivityIndicator size="small" color="#667085" />
          </View>
        ) : (
          <View className="px-5" style={styles.grow}>
            <View className="border-b border-b-gray-300 pt-6 pb-8">
              <MovePageRow
                title="닉네임"
                subtitle={me?.nickname}
                onPress={() =>
                  navigation.push(tabStackNavigations.MYPAGE_NICKNAME)
                }
              />
              <MovePageRow
                title="개인정보"
                onPress={() =>
                  navigation.push(tabStackNavigations.MYPAGE_PERSONAL)
                }
              />
              <MovePageRow
                title="비밀번호"
                onPress={() =>
                  navigation.push(tabStackNavigations.MYPAGE_PASSWORD)
                }
              />
            </View>

            <View className="pt-8" style={styles.grow}>
              <View className="pb-[22px]">
                <Text className="text-sm text-gray-600">이메일 주소</Text>
              </View>
              <Text className="text-gray-900">{me?.email}</Text>

              {/* 로그아웃 · 회원탈퇴 — web AccountManagement(가운데, 세로 구분선) */}
              <View
                className="items-end justify-center pt-10"
                style={styles.grow}>
                <View className="w-full flex-row items-center justify-center">
                  <Pressable
                    onPress={() => setDialog('logout')}
                    accessibilityRole="button"
                    accessibilityLabel="로그아웃"
                    style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}
                    className="rounded-lg px-6 py-3">
                    <Text className="text-[13px] text-gray-500">로그아웃</Text>
                  </Pressable>
                  <View className="bg-gray-200" style={styles.divider} />
                  <Pressable
                    onPress={() => setDialog('withdraw')}
                    accessibilityRole="button"
                    accessibilityLabel="회원탈퇴"
                    style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}
                    className="rounded-lg px-6 py-3">
                    <Text className="text-[13px] text-gray-500">회원탈퇴</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <ConfirmModal
        visible={dialog === 'logout'}
        title="로그아웃"
        description={
          <Text className="text-center text-gray-700">
            로그아웃 시 알림을 받을 수 없어요.{'\n'}
            지름알림에서 <Text className="font-semibold">로그아웃</Text>할까요?
          </Text>
        }
        confirmLabel="로그아웃"
        onCancel={() => setDialog(null)}
        onConfirm={() => {
          // ★화면을 먼저 닫지 않는다 — 로그아웃이 끝나면 RootNavigator 가
          // AuthNavigator 로 갈아치우므로 이 화면은 통째로 사라진다.
          setDialog(null);
          logout();
        }}
      />
      <ConfirmModal
        visible={dialog === 'withdraw'}
        title="회원탈퇴"
        description={
          <Text className="text-center text-gray-700">
            회원탈퇴 시 모든 계정 정보가 삭제돼요.{'\n'}
            지름알림에서 <Text className="font-semibold">회원탈퇴</Text>할까요?
          </Text>
        }
        confirmLabel="회원탈퇴"
        loading={isWithdrawing}
        onCancel={() => setDialog(null)}
        onConfirm={() => withdraw()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {flexGrow: 1},
  grow: {flex: 1},
  /** web `h-3 w-px bg-gray-200` — 로그아웃/회원탈퇴 사이 세로 구분선. */
  divider: {width: 1, height: 12},
});
