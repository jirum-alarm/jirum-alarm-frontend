import React, {useEffect, useRef} from 'react';
import {Animated, View} from 'react-native';

import {useReduceMotion} from '@/shared/hooks/useReduceMotion';
import {useColors} from '@/shared/theme/useColors';

/**
 * 화면 공용 스켈레톤.
 *
 * 빈 화면 + 작은 스피너는 "로딩 중"이 아니라 "고장난 화면"처럼 보인다.
 * 홈만 스켈레톤을 갖고 있어 탭마다 로딩 인상이 갈렸다 — 같은 앱인데
 * 홈은 뼈대가 뜨고 발견·알림은 흰 바탕에 점 하나였다.
 *
 * ★크기를 실제 컴포넌트와 맞춘다. 어긋나면 데이터가 도착할 때 레이아웃이
 * 튀어서 스켈레톤을 쓴 의미가 없다(깜빡임을 없애려다 한 번 더 움직인다).
 */

/** 은은한 깜빡임. 정지된 회색 판은 "멈춘 화면"처럼 보인다. */
export function useShimmer() {
  const opacity = useRef(new Animated.Value(0.5)).current;
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    // "동작 줄이기" 사용자에겐 끝없는 깜빡임이 불편하다 — 판을 멈춘 채 둔다.
    if (reduceMotion) {
      opacity.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, reduceMotion]);

  return opacity;
}

/** 회색 판 한 장. 모든 스켈레톤의 기본 단위. */
export function SkeletonBox({
  className,
  style,
}: {
  className?: string;
  style?: object;
}) {
  const opacity = useShimmer();
  const c = useColors();
  return (
    <Animated.View
      className={className}
      // gray-200 — gray-100 에 깜빡임(0.5)까지 겹치면 흰 바탕과 거의 구분이 안 됐다
      // (상세 첫 로딩에서 "스켈레톤이 잘 안 보인다" 사용자 지적).
      style={[{backgroundColor: c.gray[200], opacity}, style]}
    />
  );
}

/**
 * 가로 스크롤 칩 줄(카테고리 탭 등).
 * CategoryTabBar 와 같은 높이(32)·간격(8)로 맞춘다.
 */
export function ChipRowSkeleton({count = 5}: {count?: number}) {
  return (
    <View className="flex-row px-5" style={{gap: 8}}>
      {Array.from({length: count}).map((_, i) => (
        <SkeletonBox
          key={i}
          style={{
            height: 32,
            width: i === 0 ? 48 : 64,
            borderRadius: 16,
          }}
        />
      ))}
    </View>
  );
}

/**
 * 썸네일 + 2줄 텍스트 목록. 상품 행·알림 행이 같은 골격이라 함께 쓴다.
 * ProductRow 와 같은 썸네일 크기(72)·패딩(20/12)으로 맞춘다.
 */
export function ListRowsSkeleton({
  count = 6,
  thumbnailSize = 72,
}: {
  count?: number;
  thumbnailSize?: number;
}) {
  return (
    <View>
      {Array.from({length: count}).map((_, i) => (
        <View
          key={i}
          className="flex-row items-center px-5"
          style={{paddingVertical: 12, gap: 12}}>
          <SkeletonBox
            style={{
              width: thumbnailSize,
              height: thumbnailSize,
              borderRadius: 8,
            }}
          />
          <View style={{flex: 1, gap: 8}}>
            <SkeletonBox style={{height: 14, borderRadius: 4}} />
            <SkeletonBox style={{height: 14, width: '60%', borderRadius: 4}} />
            <SkeletonBox style={{height: 18, width: 84, borderRadius: 4}} />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * 2·3열 상품 그리드(실시간·검색·큐레이션·찜). CurationGrid·GridCard 와 같은 치수 —
 * 정사각 썸네일 + 제목 2줄 + 출처 + 가격, 좌우 20·열 간격 12·행 간격 20.
 * ★깜빡임 하나를 통째로 공유한다 — 칸마다 SkeletonBox 를 쓰면 애니메이션이 수십 개 돈다.
 */
export function GridSkeleton({
  columns = 2,
  rows = 3,
  topSpacing = 16,
}: {
  columns?: 2 | 3;
  rows?: number;
  topSpacing?: number;
}) {
  const opacity = useShimmer();
  const c = useColors();
  const bar = {backgroundColor: c.gray[200], borderRadius: 4};
  return (
    <Animated.View
      style={{opacity, paddingHorizontal: 20, paddingTop: topSpacing, gap: 20}}
      accessibilityLabel="불러오는 중"
      accessibilityRole="progressbar">
      {Array.from({length: rows}).map((_, r) => (
        <View key={r} style={{flexDirection: 'row', gap: 12}}>
          {Array.from({length: columns}).map((__, c) => (
            <View key={c} style={{flex: 1, gap: 6}}>
              <View style={[bar, {aspectRatio: 1, borderRadius: 8}]} />
              <View style={[bar, {height: 14}]} />
              <View style={[bar, {height: 14, width: '70%'}]} />
              <View style={[bar, {height: 12, width: '45%'}]} />
              <View style={[bar, {height: 18, width: '55%'}]} />
            </View>
          ))}
        </View>
      ))}
    </Animated.View>
  );
}
