import React from 'react';
import {Pressable, View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';

import {parsePostContent} from '@/entities/community';
import ThumbsupFill from '@/shared/components/icons/ThumbsupFill';
import {displayTime} from '@/shared/lib/format/price';
import {cn} from '@/shared/lib/styling';
import type {CommunityPostDetail} from '@/shared/api/community';

import NoticeAuthor from './NoticeAuthor';
import Thumbnail from '@/shared/components/product/Thumbnail';
import PostImages from './PostImages';
import PostStats from './PostStats';
import {gaps} from './community-styles';
import {tick} from '@/shared/lib/feedback';

/** 태그 상품 카드 색 — web 이 하드코딩한 값 그대로(토큰이 아니다). */
const TAG_CARD_BG = '#F3F7FF';
const TAG_BADGE_BG = '#DCE8FF';
const TAG_BADGE_TEXT = '#4378F5';

/**
 * 글 본문. web `features/community/ui/CommunityPostDetail` 의 위쪽 절반
 * (헤더·제목·본문·이미지·태그상품·통계/추천)을 그대로 옮겼다.
 *
 * 댓글은 화면(`CommunityPostScreen`)이 FlatList 로 그린다 — 본문까지 같은
 * 리스트의 헤더로 넣어야 댓글 무한스크롤이 성립한다(ScrollView 안에
 * FlatList 를 중첩하면 스크롤이 두 겹이 된다).
 */
export default function CommunityPostBody({
  post,
  onPressLike,
  onPressTaggedProduct,
}: {
  post: NonNullable<CommunityPostDetail>;
  onPressLike: () => void;
  onPressTaggedProduct: (productId: number) => void;
}) {
  const {content: displayContent, images} = parsePostContent(post.content);
  // 태그 없는 글도 서버가 id '0' 으로 채워 보낸다(목록 카드와 같은 판정).
  const hasTaggedProduct =
    !!post.taggedProduct?.id && post.taggedProduct.id !== '0';

  return (
    <View>
      <View className="flex-row items-center px-5 py-4" style={gaps.g8}>
        {post.isNotice ? (
          <NoticeAuthor size={24} />
        ) : (
          <Text className="text-sm font-medium text-gray-700">
            {post.author?.nickname ?? '알 수 없음'}
          </Text>
        )}
        <Text className="text-xs text-gray-500">
          {displayTime(post.createdAt)}
        </Text>
      </View>

      {post.title ? (
        <Text className="px-5 pb-2 text-lg font-bold text-gray-900">
          {post.title}
        </Text>
      ) : null}

      {displayContent ? (
        <Text className="px-5 pb-4 text-base leading-6 text-gray-800">
          {displayContent}
        </Text>
      ) : null}

      <PostImages images={images} />

      {hasTaggedProduct && post.taggedProduct ? (
        <Pressable
          onPress={() => onPressTaggedProduct(Number(post.taggedProduct!.id))}
          accessibilityRole="button"
          accessibilityLabel={`태그한 상품 ${post.taggedProduct.title}`}
          // ★Pressable 엔 opacity 만(ThemeCards 주석 참조). 바탕·여백은 안쪽 View.
          style={({pressed}) => ({opacity: pressed ? 0.8 : 1})}>
          <View
            className="mx-5 mb-4 rounded-2xl p-4"
            style={{backgroundColor: TAG_CARD_BG}}>
            <View
              className="self-start rounded-full px-2.5 py-0.5"
              style={{backgroundColor: TAG_BADGE_BG}}>
              <Text
                className="text-xs font-medium"
                style={{color: TAG_BADGE_TEXT}}>
                태그한 상품
              </Text>
            </View>
            <View className="flex-row items-center pt-3">
              {post.taggedProduct.thumbnail ? (
                <View className="h-20 w-20 overflow-hidden rounded-xl bg-white">
                  <Thumbnail uri={post.taggedProduct.thumbnail} />
                </View>
              ) : null}
              <View className="min-w-0 flex-1 pl-3">
                <Text
                  className="text-sm font-medium text-gray-900"
                  numberOfLines={2}>
                  {post.taggedProduct.title}
                </Text>
                {post.taggedProduct.price ? (
                  <Text className="pt-1.5 text-base font-bold text-gray-900">
                    {post.taggedProduct.price}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        </Pressable>
      ) : null}

      {/* 통계 + 추천. web 은 위아래 경계선(border-y) 안에 둔다. */}
      <View className="flex-row items-center justify-between border-y border-gray-100 px-5 py-3">
        <PostStats
          likeCount={post.likeCount}
          viewCount={post.viewCount}
          size="md"
        />
        <Pressable
          onPress={() => {
            tick();
            onPressLike();
          }}
          accessibilityRole="button"
          accessibilityLabel={`추천 ${post.likeCount ?? 0}`}
          accessibilityState={{selected: !!post.isMyLike}}
          hitSlop={8}
          style={({pressed}) => (pressed ? {opacity: 0.6} : null)}
          className={cn(
            'flex-row items-center rounded-full border px-4 py-1.5',
            post.isMyLike
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200',
          )}>
          <ThumbsupFill width={18} height={18} active={!!post.isMyLike} />
          <Text
            className={cn(
              'pl-2 text-sm font-medium',
              // primary-500 은 primary-50 배경 위에서 대비 1.3:1 이라 글자가 안 읽힌다.
              post.isMyLike ? 'text-primary-800' : 'text-gray-500',
            )}>
            추천
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
