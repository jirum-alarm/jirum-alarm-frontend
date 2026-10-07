import React from 'react';
import Svg, {Circle, Path, type SvgProps} from 'react-native-svg';

import {useColors} from '@/shared/theme/useColors';

/**
 * 내정보 메뉴 아이콘. web `shared/ui/common/icons/{Grid,Hashtag,Filter,Description,Headset}`
 * 의 패스를 그대로 옮겼다.
 *
 * ★`src/shared/components/icons/` 에 넣지 않는다 — 이번 작업 동안 다른 화면과
 * 같은 파일을 건드리지 않기로 했다. 다른 화면에서도 쓰게 되면 그때 올린다.
 */

/** 키워드 알림(#) — 알림(종)과 구분. stroke 라 색을 직접 받는다. */
export function HashtagMenuIcon({color: colorProp, ...props}: SvgProps) {
  const c = useColors();
  const color = colorProp ?? c.gray[900];
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
      <Path
        stroke={color as string}
        strokeLinecap="round"
        strokeWidth={1.5}
        d="M11.5 5.5 9.5 22.5M18.5 5.5l-2 17M6.5 10.5h16M5.5 17.5h16"
      />
    </Svg>
  );
}

/** 관심 카테고리(네 칸) — 알림 설정(슬라이더)과 구분. */
export function GridMenuIcon({color: colorProp, ...props}: SvgProps) {
  const c = useColors();
  const color = colorProp ?? c.gray[900];
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
      <Path
        stroke={color as string}
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M5.75 6.75a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1zM15.25 6.75a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1zM5.75 16.25a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1zM15.25 16.25a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1z"
      />
    </Svg>
  );
}

/** 알림 설정(슬라이더). */
export function FilterMenuIcon({color: colorProp, ...props}: SvgProps) {
  const c = useColors();
  const color = colorProp ?? c.gray[900];
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
      <Path
        fill={color as string}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.823 11.374a1.282 1.282 0 1 0 0-2.564 1.282 1.282 0 0 0 0 2.563m0 1.5c1.277 0 2.352-.86 2.68-2.032H22.5v-1.5h-8.997a2.783 2.783 0 0 0-5.36 0H5.5v1.5h2.643a2.783 2.783 0 0 0 2.68 2.031m9.391 5.784a2.783 2.783 0 0 1-5.36 0H5.5v-1.5h9.355a2.783 2.783 0 0 1 5.36 0H22.5v1.5zm-1.398-.75a1.282 1.282 0 1 1-2.564 0 1.282 1.282 0 0 1 2.564 0"
      />
    </Svg>
  );
}

/** 약관 및 정책(문서). */
export function DescriptionMenuIcon({color: colorProp, ...props}: SvgProps) {
  const c = useColors();
  const color = colorProp ?? c.gray[900];
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
      <Path
        fill={color as string}
        d="M10.25 19.75h7.5v-1.5h-7.5zm0-4h7.5v-1.5h-7.5zM8.308 23.5c-.505 0-.933-.175-1.283-.525a1.745 1.745 0 0 1-.525-1.283V6.308c0-.505.175-.933.525-1.283.35-.35.778-.525 1.283-.525h7.942l5.25 5.25v11.942c0 .505-.175.933-.525 1.283-.35.35-.778.525-1.283.525zm7.192-13V6H8.308a.294.294 0 0 0-.212.096.294.294 0 0 0-.096.212v15.384c0 .077.032.148.096.212a.294.294 0 0 0 .212.096h11.384a.294.294 0 0 0 .212-.096.294.294 0 0 0 .096-.212V10.5z"
      />
    </Svg>
  );
}

/** 고객센터(헤드셋). */
export function HeadsetMenuIcon({color: colorProp, ...props}: SvgProps) {
  const c = useColors();
  const color = colorProp ?? c.gray[900];
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
      <Path
        fill={color as string}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14 21.692v1.829h3.04v-.329h3.652c.505 0 .933-.175 1.283-.525.35-.35.525-.777.525-1.282V12c0-1.17-.223-2.27-.67-3.3a8.633 8.633 0 0 0-1.826-2.704A8.635 8.635 0 0 0 17.3 4.17 8.218 8.218 0 0 0 14 3.5c-1.17 0-2.27.223-3.3.67a8.634 8.634 0 0 0-2.704 1.826A8.634 8.634 0 0 0 6.17 8.7 8.217 8.217 0 0 0 5.5 12v6.692c0 .505.175.933.525 1.283.35.35.778.525 1.283.525h3.23v-7.077H7V12c0-1.933.683-3.583 2.05-4.95C10.417 5.683 12.067 5 14 5c1.933 0 3.583.683 4.95 2.05C20.317 8.417 21 10.067 21 12v1.423h-3.538V20.5H21v.885a.3.3 0 0 1-.087.22.3.3 0 0 1-.22.087H17.04v-.38H14zM9.038 19h-1.73a.3.3 0 0 1-.221-.087.3.3 0 0 1-.087-.22v-3.77h2.038zM21 19h-2.038v-4.077H21z"
      />
    </Svg>
  );
}

/** 화면 모드(반쯤 채운 원). 다른 메뉴 아이콘과 같은 28 박스·stroke 1.5. */
export function ThemeMenuIcon({color: colorProp, ...props}: SvgProps) {
  const c = useColors();
  const color = colorProp ?? c.gray[900];
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
      <Circle
        cx={14}
        cy={14}
        r={9}
        stroke={color as string}
        strokeWidth={1.5}
      />
      <Path d="M14 5a9 9 0 0 1 0 18z" fill={color as string} />
    </Svg>
  );
}
