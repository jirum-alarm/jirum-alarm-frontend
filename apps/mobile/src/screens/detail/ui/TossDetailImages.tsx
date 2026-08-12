import React, {useEffect, useState} from 'react';
import {Image, View} from 'react-native';

/**
 * 토스 상세 상품 이미지. 여러 장을 여백 없이 세로로 이어붙인다.
 *
 * web 은 `<img className="block w-full">` 한 줄이면 되지만 RN Image 는 높이를
 * 명시해야 그려진다. 원본 비율을 Image.getSize 로 재서 폭에 맞춘다 —
 * 상세 이미지는 세로로 긴 경우가 많아 고정비율로 자르면 내용이 날아간다.
 */
function AutoHeightImage({uri, width}: {uri: string; width: number}) {
  const [ratio, setRatio] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    Image.getSize(
      uri,
      (w, h) => {
        if (alive && w > 0) setRatio(h / w);
      },
      () => {
        // 크기를 못 재면 그리지 않는다(잘못된 높이로 레이아웃이 튀는 것보다 낫다).
        if (alive) setRatio(null);
      },
    );
    return () => {
      alive = false;
    };
  }, [uri]);

  if (!ratio) return null;

  return (
    <Image
      source={{uri}}
      style={{width, height: width * ratio}}
      resizeMode="contain"
    />
  );
}

export default function TossDetailImages({images}: {images?: string[] | null}) {
  const [width, setWidth] = useState(0);

  if (!images?.length) return null;

  return (
    <View
      className="w-full"
      onLayout={e => setWidth(e.nativeEvent.layout.width)}>
      {width > 0
        ? images.map((src, i) => (
            <AutoHeightImage key={`${src}-${i}`} uri={src} width={width} />
          ))
        : null}
    </View>
  );
}
