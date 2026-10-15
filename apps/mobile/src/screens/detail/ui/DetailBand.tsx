import React from 'react';
import {View} from 'react-native';

/**
 * 상세 본문의 큰 묶음 사이 8px 회색 띠(web DetailSection 의 border-t-8 과 같다).
 * 앞 섹션은 아래 여백이 없고 다음 섹션은 pt-7 로 시작해서, 띠 위에 mt-7 을 둬 양쪽을 띄운다.
 * 조건부로 그려지는 섹션은 띠를 자기 안에 둔다 — 섹션이 null 이면 띠도 같이 사라져 띠 두 줄이 붙지 않는다.
 */
export default function DetailBand() {
  return <View className="mt-7 h-2 bg-gray-100" />;
}
