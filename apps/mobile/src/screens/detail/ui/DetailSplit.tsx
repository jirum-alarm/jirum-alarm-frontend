import React, {useState} from 'react';
import {useWindowDimensions, View} from 'react-native';

import {useContentWidth} from '@/shared/components/SideSafeArea';
import {twoPaneMediaSize, useTwoPane} from '@/shared/hooks/useWideLayout';

/** 나눈 화면에서 사진 둘레 여백 = 화면 좌우 여백(gutter 20). */
const PADDING = 20;

/**
 * 상세 틀 — 넓은 가로 화면(듀오 펼침·폴드·태블릿 가로, 가로 아이폰)이면 사진은 왼쪽에 고정하고 정보만 오른쪽에서
 * 스크롤한다. 정사각 사진을 위에 두면 사진 한 장이 낮은 화면을 다 먹었다. 그 밖엔 사진이 정보 맨 위(같이 스크롤).
 * 상세 화면과 스켈레톤이 같은 틀을 써서 데이터가 와도 자리가 안 바뀐다.
 *
 * children 은 «정보 쪽에 둘 사진»(나누면 null)과 나눴는지를 받는다.
 */
export default function DetailSplit({
  media,
  children,
}: {
  media: React.ReactNode;
  children: (inlineMedia: React.ReactNode, split: boolean) => React.ReactNode;
}) {
  const split = useTwoPane();
  const contentWidth = useContentWidth();
  const {height: windowHeight} = useWindowDimensions();
  const [height, setHeight] = useState(0);
  const mediaSize = twoPaneMediaSize(
    contentWidth,
    (height || windowHeight * 0.6) - PADDING * 2,
  );

  return (
    <View
      className={split ? 'flex-1 flex-row' : 'flex-1'}
      onLayout={e => setHeight(e.nativeEvent.layout.height)}>
      {split ? (
        <View
          style={{
            width: mediaSize + PADDING,
            paddingLeft: PADDING,
            paddingTop: PADDING,
          }}>
          <View
            className="overflow-hidden rounded-xl"
            style={{width: mediaSize}}>
            {media}
          </View>
        </View>
      ) : null}
      {children(split ? null : media, split)}
    </View>
  );
}
