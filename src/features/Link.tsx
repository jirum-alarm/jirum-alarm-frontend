// components/Link.tsx

import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react';
import NextLink, { type LinkProps as NextLinkProps } from 'next/link';

type LinkProps = NextLinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps> & {
    children?: ReactNode;
  };

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function LinkWithRef(
  {
    // Turn next/link prefetching off by default.
    // @see https://github.com/vercel/next.js/discussions/24009
    prefetch = false,
    ...rest
  },
  ref,
) {
  return <NextLink prefetch={prefetch} {...rest} ref={ref} />;
});

export default Link;
