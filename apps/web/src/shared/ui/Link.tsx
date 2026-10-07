'use client';

import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import { forwardRef } from 'react';

import { PAGE } from '@/shared/config/page';
import { summonKeyboard } from '@/shared/lib/summon-keyboard';

type LinkProps = NextLinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps> & {
    children?: React.ReactNode;
  };

// prefetch 기본값은 Next 기본(auto = loading.tsx 경계까지). 예전 `true` 는 동적 라우트를 본문까지
// 풀 SSR 프리페치해서 홈 1뷰가 상세 SSR 27회(GraphQL ~270콜) + 남의 상세 이미지 457KB 를 만들었다.
// loading.tsx 가 있어 전환은 그대로 즉시다.
// 검색 버튼(어느 화면이든 `/search` 로 가는 링크)은 누르는 순간 키보드를 올린다 — 검색 입력창이 포커스를 넘겨받는다.
const Link = forwardRef<HTMLAnchorElement, LinkProps>(function LinkWithRef(props, ref) {
  const { onClick, href } = props;
  return (
    <NextLink
      {...props}
      ref={ref}
      onClick={(e) => {
        onClick?.(e);
        if (
          href === PAGE.SEARCH &&
          !e.defaultPrevented &&
          !e.metaKey &&
          !e.ctrlKey &&
          !e.shiftKey
        ) {
          summonKeyboard();
        }
      }}
    />
  );
});

export default Link;
