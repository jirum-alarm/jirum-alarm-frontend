import React from 'react';
import {Pressable, type PressableProps} from 'react-native';
import {press} from '@jirum/design-system/recipes';

/**
 * 누르는 동안 흐려지는 Pressable — 면이 없는 아이콘 버튼·글자 링크용(면이 있으면 PressableScale).
 * 디자인 시스템 `press.dim`. 맨 Pressable 은 눌러도 티가 안 나 «씹혔나?» 하고 다시 누르게 된다.
 *
 * ★함수형 style 엔 opacity 객체만 둔다 — 레이아웃을 섞으면 NativeWind 가 떨군다. 모양은 className.
 * 호출부가 style 을 주면 그 뒤에 opacity 를 얹는다.
 */
export default function PressableOpacity({style, ...rest}: PressableProps) {
  return (
    <Pressable
      {...rest}
      style={state => [
        typeof style === 'function' ? style(state) : style,
        {opacity: state.pressed ? press.dim : 1},
      ]}
    />
  );
}
