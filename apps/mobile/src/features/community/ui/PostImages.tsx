import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';

/**
 * 상세 본문의 첨부 이미지. web `features/community/ui/PostImages` 대응.
 *
 * 🔴 **원본 크기가 저장되지 않는다.** 본문 마커에는 URL 만 들어 있어
 * (`:::jirum-images` 블록) 서버 응답으로는 비율을 알 수 없다. 그래서 고정 비율
 * 박스에 `cover` 로 넣으면 세로 스크린샷이 반드시 잘린다.
 *
 * 처방: 한 장이면 `Image.getSize` 로 **실측**해서 그 비율로 그린다(RN 에는
 * CSS `height:auto` 가 없다 — 비율을 알아야 높이를 정할 수 있다).
 * 여러 장은 web 과 같이 정사각 그리드 + `contain` 이라 잘리지 않는다
 * (대신 위아래에 회색 여백이 남는다 — 잘리는 것보다 낫다는 web 의 판단을 따른다).
 *
 * ponytail: 업로드 때 width/height 를 같이 저장하게 되면 실측이 필요 없어진다.
 * 그때까지는 이게 잘림을 없애는 유일한 방법이다.
 */

const MAX_IMAGES = 5;
/** 세로로 긴 스크린샷이 화면 몇 개를 잡아먹지 않게. 넘으면 contain 으로 눕힌다. */
const MIN_ASPECT_RATIO = 0.6; // 세로 5 : 가로 3
const MAX_ASPECT_RATIO = 2.5;
/** 실측이 오기 전 자리. */
const PLACEHOLDER_ASPECT_RATIO = 4 / 3;

function useMeasuredAspectRatio(uri?: string) {
  const [ratio, setRatio] = useState<number | null>(null);

  useEffect(() => {
    if (!uri) return;
    let alive = true;
    setRatio(null);
    Image.getSize(
      uri,
      (width, height) => {
        if (!alive || !width || !height) return;
        setRatio(width / height);
      },
      // 실패하면 자리값 그대로 둔다 — 여기서 던지면 상세가 통째로 죽는다.
      () => {},
    );
    return () => {
      alive = false;
    };
  }, [uri]);

  return ratio;
}

function SingleImage({uri}: {uri: string}) {
  const measured = useMeasuredAspectRatio(uri);
  const clamped =
    measured == null
      ? PLACEHOLDER_ASPECT_RATIO
      : Math.min(Math.max(measured, MIN_ASPECT_RATIO), MAX_ASPECT_RATIO);

  return (
    <View
      className="mx-5 mb-4 overflow-hidden rounded-xl bg-gray-100"
      style={{aspectRatio: clamped}}>
      <Image
        source={{uri}}
        className="h-full w-full"
        // 실측 비율이면 contain 이 잘림 없이 꽉 찬다. 위 clamp 에 걸린
        // 극단적 비율에서만 회색 여백이 남는다.
        resizeMode="contain"
        accessibilityIgnoresInvertColors
        accessibilityLabel="게시글 이미지"
      />
    </View>
  );
}

export default function PostImages({images}: {images: string[]}) {
  const list = images.slice(0, MAX_IMAGES);
  if (list.length === 0) return null;

  if (list.length === 1) {
    return <SingleImage uri={list[0]} />;
  }

  return (
    <View
      className="mx-5 mb-4 flex-row flex-wrap"
      // web grid-cols-2 gap-2 대응. 반쪽 폭은 4px(=gap/2)씩 뺀다.
      style={styles.grid}>
      {list.map((uri, index) => (
        <View
          key={`${uri}-${index}`}
          className="overflow-hidden rounded-xl bg-gray-100"
          style={styles.gridCell}>
          <Image
            source={{uri}}
            className="h-full w-full"
            resizeMode="contain"
            accessibilityIgnoresInvertColors
            accessibilityLabel={`게시글 이미지 ${index + 1}`}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {gap: 8},
  /** 2열. gap 8 을 빼고 나눈 값(50% 로 두면 한 줄에 하나만 들어간다). */
  gridCell: {width: '48%', aspectRatio: 1},
});
