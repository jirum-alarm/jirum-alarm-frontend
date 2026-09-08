import React from 'react';
import {Pressable, Text, View} from 'react-native';

import {getPostDisplayContent} from '@/entities/community';
import {displayTime} from '@/shared/lib/format/price';
import type {CommunityPost} from '@/shared/api/community';

import NoticeAuthor from './NoticeAuthor';
import PostStats from './PostStats';
import {gaps} from './community-styles';

/**
 * 공지 탭 전용 한 줄. web `features/community/ui/NoticePostCard` 대응 —
 * 썸네일이 없고 제목이 앞에 온다(제목이 없으면 본문을 제목 자리에 쓴다).
 *
 * ★"NEW" 는 목록의 **첫 줄에만** 붙는다(web `isNew={i === 0}`). 카드가 스스로
 * 판단하지 않고 목록이 알려준다 — 안 그러면 모든 공지가 NEW 가 된다.
 */
export default function NoticePostCard({
  post,
  isNew,
  onPress,
}: {
  post: CommunityPost;
  isNew?: boolean;
  onPress: (postId: number) => void;
}) {
  const displayContent = getPostDisplayContent(post.content);

  return (
    <Pressable
      onPress={() => onPress(Number(post.id))}
      accessibilityRole="button"
      accessibilityLabel={post.title ?? displayContent}
      style={({pressed}) => (pressed ? {opacity: 0.6} : null)}
      android_ripple={{color: '#F2F4F7'}}
      className="w-full border-b border-gray-100 bg-white px-5 py-4">
      <View className="flex-row items-center" style={gaps.g8}>
        <NoticeAuthor />
        <Text className="text-xs text-gray-500">
          {displayTime(post.createdAt)}
        </Text>
        {isNew ? (
          <View className="bg-secondary-500 rounded px-1.5 py-0.5">
            <Text className="text-xs font-semibold text-white">NEW</Text>
          </View>
        ) : null}
      </View>

      <Text
        className="mt-2 text-sm font-semibold text-gray-900"
        numberOfLines={1}>
        {post.title ?? displayContent}
      </Text>
      {post.title && displayContent ? (
        <Text className="mt-0.5 text-sm text-gray-600" numberOfLines={1}>
          {displayContent}
        </Text>
      ) : null}

      <View className="mt-2">
        <PostStats
          likeCount={post.likeCount}
          viewCount={post.viewCount}
          replyCount={post.replyCount}
        />
      </View>
    </Pressable>
  );
}
