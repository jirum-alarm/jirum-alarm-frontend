'use client';

import NextLink, { type LinkProps as NextLinkProps } from 'next/link';

import { useDevice } from '@/shared/hooks/useDevice';
import { WebViewBridge, WebViewEventType } from '@/shared/lib/webview';

type LinkProps = NextLinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps> & {
    children?: React.ReactNode;
  };

function Link({ prefetch = true, replace = false, ...rest }: LinkProps) {
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
  return <NextLink prefetch={prefetch} {...rest} onClick={handleClickLink} />;
}

export default Link;
