'use client';

import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import { forwardRef } from 'react';

import { WebViewBridge } from '@/shared/lib/webview/sender';
import { WebViewEventType } from '@/shared/lib/webview/type';

const PRODUCT_DETAIL_PATTERN = /^\/products\/\d+/;

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

    if (typeof window !== 'undefined' && window.ReactNativeWebView) {
      const href = typeof rest.href === 'string' ? rest.href : '';
      if (href && PRODUCT_DETAIL_PATTERN.test(href)) {
        event.preventDefault();
        WebViewBridge.sendMessage(WebViewEventType.ROUTE_CHANGED, {
          data: { url: href, type: 'push' },
        });
      }
    }
  };
  return <NextLink prefetch={prefetch} {...rest} ref={ref} onClick={handleClickLink} />;
});

export default Link;
