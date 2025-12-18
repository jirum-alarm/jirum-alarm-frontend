'use client';

import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import { forwardRef } from 'react';

import { useDevice } from '@/hooks/useDevice';

import { WebViewBridge, WebViewEventType } from '@shared/lib/webview';

type LinkProps = NextLinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps> & {
    children?: React.ReactNode;
  };

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function LinkWithRef(
  { prefetch = true, replace = false, ...rest },
  ref,
) {
  const {
    device: { isJirumAlarmApp },
  } = useDevice();
  const handleClickLink = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (isJirumAlarmApp) {
      event.preventDefault();
      WebViewBridge.sendMessage(WebViewEventType.ROUTE_CHANGED, {
        data: { url: rest.href as string, type: replace ? 'replace' : 'push' },
      });
      return;
    }
    rest.onClick?.(event);
  };
  return <NextLink prefetch={prefetch} {...rest} ref={ref} onClick={handleClickLink} />;
});

export default Link;
