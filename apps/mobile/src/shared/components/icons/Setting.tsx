import React from 'react';
import Svg, {Path, type SvgProps} from 'react-native-svg';

import {useColors} from '@/shared/theme/useColors';

/** web icons/Setting 과 같은 패스(슬라이더). 알림 목록 헤더의 알림 설정 진입 버튼. */
export default function Setting({
  width = 28,
  height = 28,
  color: colorProp,
  ...props
}: SvgProps) {
  const c = useColors();
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 28 28"
      fill="none"
      {...props}>
      <Path
        fill={(colorProp ?? c.gray[900]) as string}
        fillRule="evenodd"
        d="M10.823 11.374a1.282 1.282 0 1 0 0-2.564 1.282 1.282 0 0 0 0 2.563m0 1.5c1.277 0 2.352-.86 2.68-2.032H22.5v-1.5h-8.997a2.783 2.783 0 0 0-5.36 0H5.5v1.5h2.643a2.78 2.78 0 0 0 2.68 2.031m9.391 5.784a2.783 2.783 0 0 1-5.36 0H5.5v-1.5h9.355a2.783 2.783 0 0 1 5.36 0H22.5v1.5zm-1.398-.75a1.282 1.282 0 1 1-2.564 0 1.282 1.282 0 0 1 2.564 0"
        clipRule="evenodd"
      />
    </Svg>
  );
}
