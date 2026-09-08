import React from 'react';
import Svg, {Path, type SvgProps} from 'react-native-svg';

/**
 * 내정보 메뉴 아이콘 4종. web `shared/ui/common/icons/{Alert,Filter,Description,Headset}`
 * 의 패스를 그대로 옮겼다.
 *
 * ★`src/shared/components/icons/` 에 넣지 않는다 — 이번 작업 동안 다른 화면과
 * 같은 파일을 건드리지 않기로 했다. 다른 화면에서도 쓰게 되면 그때 올린다.
 */

/** 키워드 알림(종). web 은 stroke 기반이라 currentColor 대신 색을 직접 받는다. */
export function AlertMenuIcon({color = '#101828', ...props}: SvgProps) {
  return (
    <Svg width={29} height={28} viewBox="0 0 29 28" fill="none" {...props}>
      <Path
        stroke={color as string}
        strokeLinecap="square"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M11.853 23c.705.622 1.632 1 2.646 1s1.94-.378 2.646-1m3.354-13a6 6 0 1 0-12 0c0 3.09-.78 5.206-1.65 6.605-.735 1.18-1.102 1.771-1.089 1.936.015.182.054.252.2.36.133.099.732.099 1.928.099H21.11c1.197 0 1.795 0 1.927-.098.147-.11.186-.179.2-.361.014-.165-.353-.755-1.088-1.936-.87-1.399-1.65-3.515-1.65-6.605Z"
      />
    </Svg>
  );
}

/** 관심 카테고리(필터). */
export function FilterMenuIcon({color = '#101828', ...props}: SvgProps) {
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
export function DescriptionMenuIcon({color = '#101828', ...props}: SvgProps) {
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
export function HeadsetMenuIcon({color = '#101828', ...props}: SvgProps) {
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
