import React from 'react';
import {Text, View} from 'react-native';

import BubbleChat from '@/shared/components/icons/bubble_chat';
import Eye from '@/shared/components/icons/eye';
import ThumbsupFill from '@/shared/components/icons/ThumbsupFill';
import {gaps} from './community-styles';

/**
 * 추천·조회·댓글 수 한 줄. 목록 카드 2종과 상세가 같이 쓴다
 * (web 은 이 세 줄을 CommunityPostCard·NoticePostCard·CommunityPostDetail 에
 * 각각 복붙해 뒀다 — 앱에서는 한 곳으로 모은다).
 *
 * ⚠️ 회색 문자는 `gray-500` 이다. web 은 `text-gray-400` 이지만 그 색은
 * 흰 배경에서 명암비 2.58:1 로 WCAG AA(4.5:1) 미달이다.
 */
export default function PostStats({
  likeCount,
  viewCount,
  replyCount,
  size = 'sm',
}: {
  likeCount: number;
  viewCount: number;
  /** 상세에는 댓글 수 칸이 없다(web 과 같다) — 안 주면 안 그린다. */
  replyCount?: number;
  size?: 'sm' | 'md';
}) {
  const icon = size === 'sm' ? 14 : 16;
  const textClass = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <View className="flex-row items-center" style={gaps.g12}>
      <View className="flex-row items-center" style={gaps.g4}>
        <ThumbsupFill width={icon} height={icon} />
        <Text className={`${textClass} text-gray-500`}>{likeCount}</Text>
      </View>
      <View className="flex-row items-center" style={gaps.g4}>
        <Eye width={icon} height={icon} />
        <Text className={`${textClass} text-gray-500`}>{viewCount}</Text>
      </View>
      {replyCount !== undefined ? (
        <View className="flex-row items-center" style={gaps.g4}>
          <BubbleChat width={icon} height={icon} color="#667085" />
          <Text className={`${textClass} text-gray-500`}>{replyCount}</Text>
        </View>
      ) : null}
    </View>
  );
}
