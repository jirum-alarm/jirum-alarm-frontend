import React from 'react';
import {Text, View} from 'react-native';

import IconLogo from '@/shared/components/icons/IconLogo';
import {gaps} from './community-styles';

/**
 * 공지글 작성자. web `NoticeAuthor` 와 같이 개인 닉네임 대신
 * 공식 계정(로고 + 지름알림)으로 보여준다.
 *
 * ⚠️ web 은 `RoundedLogo`(흰 원 + 문자 마크), 앱에는 그 에셋이 없어 앱 로고
 * 마크(`IconLogo`)를 같은 크기의 원 안에 넣었다. 마크 자체는 다르다 —
 * 완전히 맞추려면 RoundedLogo 를 RN SVG 로 옮겨야 한다(지금은 과잉).
 */
export default function NoticeAuthor({size = 20}: {size?: number}) {
  return (
    <View className="flex-row items-center" style={gaps.g6}>
      <View
        className="items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white"
        style={{width: size, height: size}}>
        <IconLogo size={size} />
      </View>
      <Text className="text-sm font-semibold text-gray-900">지름알림</Text>
    </View>
  );
}
