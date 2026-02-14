'use client';

import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import { forwardRef } from 'react';

type LinkProps = NextLinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps> & {
    children?: React.ReactNode;
  };

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function LinkWithRef(
  { prefetch = true, ...rest },
  ref,
) {
  const handleClickLink = (event: React.MouseEvent<HTMLAnchorElement>) => {
    rest.onClick?.(event);
  };
  return <NextLink prefetch={prefetch} {...rest} ref={ref} onClick={handleClickLink} />;
});

export default Link;
