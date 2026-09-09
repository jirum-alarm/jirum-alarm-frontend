import React, {useState} from 'react';
import {Image} from 'react-native';
import type {ImageResizeMode, ImageStyle, StyleProp} from 'react-native';

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
 * ⚠️`uri` 가 바뀌면 실패 기록을 지운다. 안 지우면 목록 재사용(FlatList) 에서
 * 한 번 실패한 자리가 다음 상품에도 폴백을 그린다.
 */
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
  const [failedUri, setFailedUri] = useState<string | null>(null);

  if (!uri || failedUri === uri) {
    return <>{fallback ?? <NoImage categoryId={categoryId} type={type} />}</>;
  }

  return (
    <Image
      source={{uri}}
      style={style ?? {width: '100%', height: '100%'}}
      resizeMode={resizeMode}
      onError={() => setFailedUri(uri)}
    />
  );
}
