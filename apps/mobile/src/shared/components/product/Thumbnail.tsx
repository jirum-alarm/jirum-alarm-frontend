import React, {useState} from 'react';
import {Image} from 'react-native';
import type {ImageResizeMode, ImageStyle, StyleProp} from 'react-native';

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
  // 어느 후보까지 실패했는지. uri 가 바뀌면 리셋한다 — 안 하면 목록
  // 재사용(FlatList)에서 한 번 실패한 자리가 다음 상품에도 폴백을 그린다.
  const [failed, setFailed] = useState<{uri?: string | null; step: number}>({
    uri,
    step: 0,
  });
  const step = failed.uri === uri ? failed.step : 0;

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
      style={style ?? {width: '100%', height: '100%'}}
      resizeMode={resizeMode}
      onError={() => setFailed({uri, step: step + 1})}
    />
  );
}
