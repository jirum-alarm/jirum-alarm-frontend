import {twMergeConfig} from '@jirum/design-system';
import {type CxOptions, cx} from 'class-variance-authority';
import {extendTailwindMerge} from 'tailwind-merge';

// 디자인 토큰의 사용자 정의 값(text-13·shadow-card·rounded-t-sheet)을 알려 준다 — 모르면 text-13 을 색으로 보고 지운다.
const twMerge = extendTailwindMerge(twMergeConfig);

/**
 * `hover:` 클래스를 버린다. 앱엔 마우스 hover 가 없는데, NativeWind 는 `hover:` 가 붙은 **일반 View** 를
 * 몰래 Pressable 로 바꾼다(react-native-css-interop native-interop.js — hover·active·focus 가 있으면 upgrade).
 * 그 View 가 터치를 먼저 잡고 빈 onPress 로 삼켜, 바깥 Pressable 의 onPress 가 영영 안 불린다.
 * 2026-10-11 사고: web 과 같이 쓰는 tab 레시피의 idle 에 `hover:` 가 있어, 안쪽 View 에 모양을 주는
 * PressableScale(TabPill)·가격 추이 기간 버튼의 **비선택 탭이 전부 안 눌렸다**(커뮤니티·토스·랭킹 카테고리·기간).
 */
const dropHover = (classes: string) =>
  classes
    .split(/\s+/)
    .filter(c => c && !c.startsWith('hover:'))
    .join(' ');

/**
 * Merges Tailwind CSS classes with class-variance-authority
 *
 * @param inputs - Class names to merge
 * @returns Merged class string
 *
 * @example
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4'
 */
export const cn = (...inputs: CxOptions) => {
  return twMerge(dropHover(cx(inputs)));
};

/**
 * web 이 한 줄 문자열로 쓰는 레시피(겉 + 글자, 예: linkChip)를 앱의 겉(View)·글자(Text) 두 몫으로 나눈다.
 * RN 은 글자 모양을 Text 만 받는다 — 겉에 text-* 를 두면 안 먹고, 글자를 손으로 다시 적으면 레시피와 갈라진다.
 * `hover:` 는 버린다(cn 과 같은 이유 — 앱에서 터치를 삼킨다).
 */
export const splitBoxText = (recipe: string): {box: string; text: string} => {
  const classes = dropHover(recipe).split(' ').filter(Boolean);
  const isText = (c: string) => /^(text|font|leading|tracking)-/.test(c);
  return {
    box: classes.filter(c => !isText(c)).join(' '),
    text: classes.filter(isText).join(' '),
  };
};
