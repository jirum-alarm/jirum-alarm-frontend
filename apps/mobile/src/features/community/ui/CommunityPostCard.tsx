import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import Thumbnail from '@/shared/components/product/Thumbnail';
import {displayTime} from '@/shared/lib/format/price';
import type {CommunityPost} from '@/shared/api/community';

import {getPostCardView} from '../lib/post-card';

import NoticeAuthor from './NoticeAuthor';
import PostStats from './PostStats';
import {gaps} from './community-styles';

const THUMBNAIL_SIZE = 80; // web h-20 w-20

/**
 * 목록 한 줄. web `features/community/ui/CommunityPostCard` 대응.
 *
 * ★터치 피드백은 `PressableScale`(scale 0.95)이 아니라 눌림 opacity + ripple 이다 —
 * 행은 화면 폭을 꽉 채워서 축소가 어색하다(알림 탭 AlarmItem 과 같은 판단).
 * web 의 `active:scale-[0.98]` 은 그 관행보다 우선하지 않는다.
 */
export default function CommunityPostCard({
  post,
  onPress,
}: {
  post: CommunityPost;
  onPress: (postId: number) => void;
}) {
  const view = getPostCardView(post);

  return (
    <Pressable
      onPress={() => onPress(Number(post.id))}
      accessibilityRole="button"
      accessibilityLabel={post.title ?? view.displayContent}
      style={({pressed}) => (pressed ? {opacity: 0.6} : null)}
      android_ripple={{color: '#F2F4F7'}}
      className="w-full flex-row border-b border-gray-100 bg-white px-5 py-4"
      // gap-x-3
    >
      <View className="min-w-0 flex-1" style={{minHeight: THUMBNAIL_SIZE}}>
        {/* 헤더 — 공지는 개인 닉네임 대신 공식 계정. */}
        <View className="flex-row items-center" style={gaps.g8}>
          {post.isNotice ? (
            <NoticeAuthor />
          ) : (
            <>
              <View className="rounded bg-gray-100 px-1.5 py-0.5">
                <Text className="text-xs font-medium text-gray-500">
                  {view.badgeLabel}
                </Text>
              </View>
              <Text
                className="shrink text-sm font-medium text-gray-700"
                numberOfLines={1}>
                {view.authorName}
              </Text>
            </>
          )}
          <Text className="text-xs text-gray-500">
            {displayTime(post.createdAt)}
          </Text>
          {post.isNotice ? (
            <View className="bg-secondary-500 rounded px-1.5 py-0.5">
              <Text className="text-xs font-semibold text-white">NEW</Text>
            </View>
          ) : null}
        </View>

        {post.title ? (
          <Text
            className="mt-2 text-sm font-semibold text-gray-900"
            numberOfLines={1}>
            {post.title}
          </Text>
        ) : null}
        {view.displayContent ? (
          <Text
            className="mt-1 text-sm text-gray-600"
            // web: 제목이 있으면 본문은 한 줄(truncate), 없으면 두 줄.
            numberOfLines={post.title ? 1 : 2}>
            {view.displayContent}
          </Text>
        ) : null}

        {/* 통계는 아래 고정(web mt-auto). */}
        <View className="mt-auto pt-2">
          <PostStats
            likeCount={post.likeCount}
            viewCount={post.viewCount}
            replyCount={post.replyCount}
          />
        </View>
      </View>

      {view.previewImage ? (
        <View style={styles.thumbnailColumn}>
          <View
            className="overflow-hidden rounded-lg bg-gray-100"
            style={{width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE}}>
            {/* CDN 은 webp 만 갖고 있고 마커는 원본 확장자를 준다 → Thumbnail 이
                webp 먼저, 실패하면 원본, 그래도 안 되면 대체 그림. */}
            <Thumbnail uri={view.previewImage} />
            {view.extraImageCount > 0 ? (
              <View className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5">
                <Text className="text-[10px] font-medium text-white">
                  +{view.extraImageCount}
                </Text>
              </View>
            ) : null}
          </View>
          {view.showProductTitle ? (
            <Text className="mt-1 text-xs text-gray-500" numberOfLines={2}>
              {post.taggedProduct?.title}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  /** 오른쪽 썸네일 칸. web gap-x-3(12px) 자리. */
  thumbnailColumn: {
    width: THUMBNAIL_SIZE,
    marginLeft: 12,
  },
});
