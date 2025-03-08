'use client';
import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import { type AnchorHTMLAttributes, forwardRef, type ReactNode } from 'react';
import { WebViewBridge, WebViewEventType } from '@/shared/lib/webview';
import { useDevice } from '@/hooks/useDevice';

type LinkProps = NextLinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps> & {
    children?: ReactNode;
  };

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function LinkWithRef(
  { prefetch = true, ...rest },
  ref,
) {
  const { isJirumAlarmApp } = useDevice();
  const handleClickLink = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (isJirumAlarmApp) {
      event.preventDefault();
      WebViewBridge.sendMessage(WebViewEventType.ROUTE_CHANGED, {
        data: { url: rest.href as string },
      });
      return;
    }
    rest.onClick?.(event);
  };
  return <NextLink prefetch={prefetch} {...rest} ref={ref} onClick={handleClickLink} />;
});

export default Link;
