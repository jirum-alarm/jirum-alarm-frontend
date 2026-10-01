import React, {useState} from 'react';
import {View} from 'react-native';
import {Image} from 'expo-image';

/**
 * 토스 상세 상품 이미지. 여러 장을 여백 없이 세로로 이어붙인다.
 *
 * web 은 `<img className="block w-full">` 한 줄이면 되지만 RN 은 높이를 명시해야 그려진다.
 * 원본 비율을 **로드된 이미지에서** 읽어 폭에 맞춘다(expo-image onLoad) — 예전엔
 * `Image.getSize` 로 크기만 따로 받느라 같은 이미지를 두 번 받았고, 다 받을 때까지 아무것도
 * 안 그려 위에서부터 차례로 밀려 나왔다. 비율을 알기 전엔 정사각 자리를 잡아 둔다.
 */
const PLACEHOLDER_RATIO = 1;

function AutoHeightImage({uri, width}: {uri: string; width: number}) {
  const [ratio, setRatio] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  // 못 받으면 자리를 접는다(빈 상자보다 낫다).
  if (failed) return null;

  return (
    <Image
      source={{uri}}
      style={{width, height: width * (ratio ?? PLACEHOLDER_RATIO)}}
      contentFit="contain"
      cachePolicy="memory-disk"
      transition={120}
      onLoad={e => {
        const {width: w, height: h} = e.source;
        if (w > 0) setRatio(h / w);
      }}
      onError={() => setFailed(true)}
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
