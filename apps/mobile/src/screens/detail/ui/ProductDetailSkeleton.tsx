import React from 'react';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import type {DetailPreview} from '@/entities/product/prefetch-detail';
import Thumbnail from '@/shared/components/product/Thumbnail';
import {SkeletonBox} from '@/shared/components/Skeletons';
import {Text} from '@/shared/components/ui/Text/AppText';

/**
 * 상품 상세 첫 로딩 골격. 예전엔 흰 화면 가운데 작은 스피너 하나라 "멈춘 화면" 처럼
 * 보였다(사용자 지적 "상세 들어갈 때 스켈레톤이 잘 보이도록").
 *
 * ★실제 화면과 같은 틀 — 정사각 이미지(조회수 알약은 이미지 위에 겹쳐 자리를 안 먹는다) → 이미지 아래 24px 을
 * 덮는 둥근 카드(-mt-6·rounded-t-3xl) 안에 배지 줄(오른쪽 게시 시각)·제목 2줄·가격 줄(+추천 버튼)·
 * 선 아래 정보 표(라벨 왼쪽 64px). 어긋나면 데이터가 올 때 한 번 더 튄다.
 *
 * `preview` — 누른 카드의 사진·제목(prefetch-detail). 있으면 그 자리는 골격 대신 실물을 그린다: 사진은 카드가
 * 누르는 순간 캐시에 데워 두어 바로 뜨고, 제목은 실제 화면과 같은 글자 모양이라 데이터가 와도 자리가 안 바뀐다.
 */
export default function ProductDetailSkeleton({
  preview,
}: {
  preview?: DetailPreview | null;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-1 bg-white"
      accessibilityLabel="상품 정보를 불러오는 중">
      <View className="flex-1 overflow-hidden">
        {preview?.thumbnail ? (
          <View className="aspect-square w-full bg-gray-50">
            <Thumbnail uri={preview.thumbnail} resizeMode="cover" />
          </View>
        ) : (
          <SkeletonBox style={{width: '100%', aspectRatio: 1}} />
        )}
        <View className="-mt-6 rounded-t-3xl bg-white px-5 pt-6">
          <View className="flex-row items-center justify-between">
            <SkeletonBox style={{width: 56, height: 24, borderRadius: 8}} />
            <SkeletonBox style={{height: 14, width: 48, borderRadius: 4}} />
          </View>
          {preview?.title ? (
            <Text className="mt-3 font-medium text-gray-800">
              {preview.title}
            </Text>
          ) : (
            <>
              <SkeletonBox
                style={{
                  height: 18,
                  marginTop: 12,
                  borderRadius: 4,
                  width: '92%',
                }}
              />
              <SkeletonBox
                style={{
                  height: 18,
                  marginTop: 8,
                  borderRadius: 4,
                  width: '64%',
                }}
              />
            </>
          )}
          <View className="mt-4 flex-row items-center justify-between">
            <SkeletonBox style={{height: 32, width: 160, borderRadius: 6}} />
            <SkeletonBox style={{height: 36, width: 108, borderRadius: 18}} />
          </View>
          <View
            className="mt-6 border-t border-gray-100 pt-5"
            style={{gap: 10}}>
            {[0, 1, 2].map(i => (
              <View key={i} className="flex-row" style={{gap: 12}}>
                <SkeletonBox style={{height: 14, width: 48, borderRadius: 4}} />
                <View style={{width: 4}} />
                <SkeletonBox
                  style={{height: 14, width: '55%', borderRadius: 4}}
                />
              </View>
            ))}
          </View>
        </View>
      </View>
      {/* BottomCTA 와 같은 자리·높이 — 찜·구매 버튼이 로딩 끝에 튀어나오지 않게. */}
      <View
        className="flex-row items-center gap-x-3 border-t border-t-gray-300 px-5 pt-2"
        style={{paddingBottom: Math.max(insets.bottom, 12)}}>
        <SkeletonBox style={{width: 44, height: 44, borderRadius: 8}} />
        <SkeletonBox style={{flex: 1, height: 48, borderRadius: 8}} />
      </View>
    </View>
  );
}
