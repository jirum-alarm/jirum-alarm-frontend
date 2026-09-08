import React, {useCallback, useLayoutEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useHiddenTabBarClipPadding} from '@/shared/hooks/useHideTabBar';
import {KeyboardAvoidingView} from 'react-native-keyboard-controller';

import {UserQueries} from '@/entities/user/user.queries';
import CommunityCommentInput from '@/features/community/ui/CommunityCommentInput';
import CommunityCommentItem from '@/features/community/ui/CommunityCommentItem';
import CommunityPostBody from '@/features/community/ui/CommunityPostBody';
import PostMenu from '@/features/community/ui/PostMenu';
import {useCommunityCommentsViewModel} from '@/features/community/model/useCommunityCommentsViewModel';
import {useCommunityPostViewModel} from '@/features/community/model/useCommunityPostViewModel';
import {baseHeaderOptions} from '@/navigations/tab/native-headers';
import type {TabStackParamList} from '@/navigations/tab/types';
import Dots from '@/shared/components/icons/Dots';
import ShareIcon from '@/shared/components/icons/share';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import {SERVICE_URL} from '@/constants/env';
import {buildShareMessage, buildShareUrl} from '@/shared/lib/share';
import {tabStackNavigations} from '@/shared/constant/navigations';
import type {CommunityComment} from '@/shared/api/community';

type Props = NativeStackScreenProps<
  TabStackParamList,
  typeof tabStackNavigations.COMMUNITY_POST
>;

/**
 * 커뮤니티 글 상세. web `/community/[id]`
 * (BasicLayout + CommunityPostPageHeader + CommunityPostDetail) 대응.
 *
 * ★본문과 댓글을 **한 FlatList** 로 그린다 — 본문을 ScrollView 에 넣고 댓글을
 * FlatList 로 넣으면 스크롤이 두 겹이 되어 댓글 무한스크롤이 안 돈다.
 *
 * ★web 헤더의 로고(LogoLink)는 옮기지 않았다 — 네이티브 헤더는 뒤로가기가
 * 시스템 크롬이고, 그 옆 로고는 "홈으로"를 뜻해 탭 안에서는 갈 곳이 없다.
 */
export default function CommunityPostScreen({route, navigation}: Props) {
  const {postId} = route.params;
  const insets = useSafeAreaInsets();
  const bottomClip = useHiddenTabBarClipPadding();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {post, isPending, isError, refetch, likePost} =
    useCommunityPostViewModel(postId);
  const {data: myUserId} = useQuery(UserQueries.me());
  const {
    comments,
    isPending: isCommentsPending,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    addComment,
    isAdding,
    updateComment,
    isUpdating,
    removeComment,
    likeComment,
  } = useCommunityCommentsViewModel(postId);

  const isMyPost =
    !!myUserId && String(post?.author?.id ?? '#none') === String(myUserId);

  /**
   * 공유. web 은 채널 선택 시트(`ShareSheet`)를 쓰지만, 앱의 그 시트는
   * `screens/detail/ui/ShareSheet` 로 **상품 전용**이다(URL 을 productId 로
   * 조립한다). 커뮤니티 글 URL 을 받게 하려면 그 파일을 고쳐야 하므로,
   * 지금은 OS 공유 시트로 같은 문구를 보낸다(shareRequest 브릿지가 하던 일과
   * 동일 — `event.ts` 도 `Share.share` 로 처리한다).
   */
  const handleShare = useCallback(() => {
    const title = `${post?.title || '커뮤니티'} | 지름알림`;
    const url = buildShareUrl(`${SERVICE_URL}/community/${postId}`, 'native');
    Share.share({
      title,
      message: buildShareMessage(title, url),
    }).catch(() => {});
  }, [post?.title, postId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      ...baseHeaderOptions,
      title: '',
      // 네이티브 스택의 headerRight 는 함수만 받는다. 실제 컴포넌트는 모듈
      // 스코프의 PostHeaderActions 이므로 렌더마다 타입이 새로 생기지 않는다.
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <PostHeaderActions
          onPressShare={handleShare}
          onPressMenu={() => setMenuOpen(true)}
        />
      ),
    });
  }, [navigation, handleShare]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({item}: {item: CommunityComment}) => (
      <CommunityCommentItem
        comment={item}
        isMyComment={
          !!myUserId && String(item.author?.id ?? '#none') === String(myUserId)
        }
        isEditing={editingId === item.id}
        isUpdating={isUpdating}
        onStartEdit={() => setEditingId(item.id)}
        onCancelEdit={() => setEditingId(null)}
        onSubmitEdit={content => {
          if (!content) return;
          updateComment({id: Number(item.id), content});
          setEditingId(null);
        }}
        onRemove={() => removeComment(Number(item.id))}
        onLike={() =>
          likeComment({id: Number(item.id), isMyLike: !!item.isMyLike})
        }
      />
    ),
    [
      myUserId,
      editingId,
      isUpdating,
      updateComment,
      removeComment,
      likeComment,
    ],
  );

  if (isError || (!isPending && !post)) {
    return (
      <View className="flex-1 bg-white pt-4">
        <SectionErrorRow label="게시글" onRetry={refetch} />
      </View>
    );
  }

  if (isPending || !post) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="small" color="#667085" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
        keyboardVerticalOffset={0}>
        <FlatList
          data={comments}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={CommentSeparator}
          ListHeaderComponent={
            <>
              <CommunityPostBody
                post={post}
                onPressLike={() => likePost(post.isMyLike ? undefined : true)}
                onPressTaggedProduct={productId =>
                  navigation.push(tabStackNavigations.DETAIL, {
                    path: `/products/${productId}`,
                  })
                }
              />
              <View className="px-5 pb-2 pt-4">
                <Text className="text-base font-semibold text-gray-900">
                  댓글
                </Text>
              </View>
            </>
          }
          ListEmptyComponent={
            isCommentsPending ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="small" color="#667085" />
              </View>
            ) : (
              <View className="py-8">
                <Text className="text-center text-sm text-gray-500">
                  첫 번째 댓글을 남겨보세요
                </Text>
              </View>
            )
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4">
                <ActivityIndicator size="small" color="#667085" />
              </View>
            ) : null
          }
        />
        {/* 하단 입력창. 탭바는 이 라우트에서 숨겨지므로 safe area 만 비운다
            (ProductCommentsScreen 과 같은 값).
            ⚠️상쇄 패딩(clip 되밀기)을 쓰지 않는다 — clip 은 iOS 26
            이 남기는 하단 띠를 자를 뿐 화면 내용을 자르지 않는다. 되밀면 두 값이
            서로 다른 경로로 와서 한 프레임 어긋날 때 여백이 보인다(폐기된 방식,
            __tests__/tabbar-visibility.test.ts 가 고정). 입력창이 가려 보였던 건
            딥링크로 탭 전환+push 할 때 **탭바가 안 숨던 버그**였다. */}
        {/*
          ★clip 보정. 탭바를 숨기는 유일한 수단이 화면째로 clipPx 만큼 내려서
          잘라내는 것이라(`createNativeBottomTabNavigator`), 바닥에 붙은 이
          입력창이 그 잘린 영역으로 들어가 **통째로 사라졌다**(iOS 26 실측:
          마지막 1px 만 보였다 — 사용자 지적 2회). 내정보 하위 화면 11개는
          이미 같은 훅으로 되돌리고 있다.
        */}
        <View style={{paddingBottom: Math.max(insets.bottom, 4) + bottomClip}}>
          <CommunityCommentInput onSubmit={addComment} isPending={isAdding} />
        </View>
      </KeyboardAvoidingView>

      <PostMenu
        visible={menuOpen}
        postId={postId}
        isMyPost={isMyPost}
        onClose={() => setMenuOpen(false)}
        onEdit={() =>
          navigation.push(tabStackNavigations.COMMUNITY_WRITE, {postId})
        }
        onDeleted={() => navigation.goBack()}
      />
    </View>
  );
}

/**
 * 헤더 오른쪽(공유·더보기).
 *
 * ★모듈 스코프에 둔다 — `setOptions({headerRight})` 는 함수를 요구하는데,
 * 그 안에 JSX 를 직접 쓰면 렌더마다 새 컴포넌트 타입이 생겨 헤더 버튼이
 * 매번 다시 마운트된다(eslint react/no-unstable-nested-components).
 */
function PostHeaderActions({
  onPressShare,
  onPressMenu,
}: {
  onPressShare: () => void;
  onPressMenu: () => void;
}) {
  return (
    <View className="flex-row items-center" style={styles.headerActions}>
      <Pressable
        onPress={onPressShare}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="공유하기">
        <ShareIcon width={24} height={24} color="#101828" />
      </Pressable>
      <Pressable
        onPress={onPressMenu}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="게시글 메뉴">
        <Dots width={24} height={24} />
      </Pressable>
    </View>
  );
}

/** 댓글 사이 구분선. web divide-y divide-gray-100 대응. */
function CommentSeparator() {
  return <View className="mx-5 h-px bg-gray-100" />;
}

const styles = StyleSheet.create({
  headerActions: {gap: 16},
});
