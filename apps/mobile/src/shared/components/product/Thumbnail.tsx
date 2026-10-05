import React, {useState} from 'react';
import {Image, type ImageContentFit} from 'expo-image';
import {
  useColorScheme,
  type ImageResizeMode,
  type ImageStyle,
  type StyleProp,
} from 'react-native';

import {convertToWebp} from '@/shared/lib/format/image';

import NoImage from './NoImage';

/**
 * 원격 썸네일 + **실패 폴백**.
 *
 * 🔴`thumbnail ? <Image/> : <NoImage/>` 만으로는 부족하다. 그 분기는 URL 이
 * **없을 때**만 폴백을 태우고, URL 이 있는데 404·타임아웃이면 `<Image>` 가
 * 아무것도 안 그려 **빈 회색 상자**가 남는다(iOS 26 실측: 찜 목록 6칸 중 3칸,
 * 묶음 상세 딜 3건 — gray-50 단색, 카테고리 일러스트 없음).
 *
 * web 은 이미 이걸 처리한다(`ImageComponent` 의 `fallbackSrc` + `fallback`).
 * 앱엔 `onError` 가 **한 곳도 없었다** — 옮길 때 빠진 쪽이다.
 *
 * ★expo-image 다(RN Image 아님): 디스크 캐시(다시 켜도 안 받음)·짧은 페이드(툭 튀어나오지 않음)·
 * `recyclingKey`(FlatList 가 셀을 재사용할 때 이전 상품 그림이 잠깐 비치지 않음).
 *
 * ⚠️`uri` 가 바뀌면 실패 기록을 지운다. 안 지우면 목록 재사용(FlatList) 에서
 * 한 번 실패한 자리가 다음 상품에도 폴백을 그린다.
 */
/**
 * 다크에서 사진 밝기를 낮춘다. 상품 사진은 대부분 흰 배경이라 어두운 화면에서 밝은 네모가 줄줄이 빛나
 * 눈이 부셨다(사용자 지적). opacity 라 뒤의 어두운 카드 면이 비쳐 어두워진다.
 */
export const DARK_IMAGE_STYLE = {opacity: 0.85} as const;

export default function Thumbnail({
  uri,
  categoryId,
  type = 'product',
  style,
  resizeMode = 'cover',
  fallback,
}: {
  uri?: string | null;
  categoryId?: number | null;
  type?: 'product' | 'hotDeal';
  style?: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
  /** NoImage 대신 쓸 대체 그림(알림 카드처럼 자체 폴백이 있는 곳). */
  fallback?: React.ReactNode;
}) {
  // 어느 후보까지 실패했는지. uri 가 바뀌면 리셋한다 — 안 하면 목록
  // 재사용(FlatList)에서 한 번 실패한 자리가 다음 상품에도 폴백을 그린다.
  const [failed, setFailed] = useState<{uri?: string | null; step: number}>({
    uri,
    step: 0,
  });
  const step = failed.uri === uri ? failed.step : 0;
  const isDark = useColorScheme() === 'dark';

  // ★webp 를 먼저, 실패하면 원본. web `ImageComponent`(fallbackSrc)와 같은
  // 순서다. CDN 이 webp 만 갖고 있어 원본 확장자는 403 이 온다(convertToWebp
  // 주석 참조). 변환만 하고 폴백이 없으면 webp 가 아닌 외부 이미지
  // (쿠팡·알리 썸네일)를 되레 깨뜨린다.
  const webp = convertToWebp(uri);
  const candidates = !uri ? [] : webp && webp !== uri ? [webp, uri] : [uri];
  const current = candidates[step];

  if (!current) {
    return <>{fallback ?? <NoImage categoryId={categoryId} type={type} />}</>;
  }

  return (
    <Image
      source={{uri: current}}
      style={[
        style ?? {width: '100%', height: '100%'},
        isDark && DARK_IMAGE_STYLE,
      ]}
      contentFit={CONTENT_FIT[resizeMode] ?? 'cover'}
      cachePolicy="memory-disk"
      transition={120}
      recyclingKey={current}
      onError={() => setFailed({uri, step: step + 1})}
    />
  );
}

// 호출부는 RN 이름(resizeMode)을 그대로 쓴다 — 바꾸면 화면 수십 곳을 건드려야 한다.
const CONTENT_FIT: Partial<Record<ImageResizeMode, ImageContentFit>> = {
  cover: 'cover',
  contain: 'contain',
  stretch: 'fill',
  center: 'none',
};
