'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { WebViewBridge } from '@/shared/lib/webview/sender';
import { WebViewEventType } from '@/shared/lib/webview/type';

import { useDevice } from './useDevice';

type NavigateOptions = {
  scroll?: boolean;
};

export type MyRouter = {
  push: (href: string, options?: NavigateOptions) => void;
  replace: (href: string, options?: NavigateOptions) => void;
  back: () => void;
};

const PRODUCT_DETAIL_PATTERN = /^\/products\/\d+/;

export default function useMyRouter(): MyRouter {
  const router = useRouter();
  const { device } = useDevice();

  const push = useCallback(
    (href: string, options?: NavigateOptions) => {
      if (device.isJirumAlarmApp && PRODUCT_DETAIL_PATTERN.test(href)) {
        WebViewBridge.sendMessage(WebViewEventType.ROUTE_CHANGED, {
          data: { url: href, type: 'push' },
        });
        return;
      }
      router.push(href, options);
    },
    [router, device.isJirumAlarmApp],
  );

  const replace = useCallback(
    (href: string, options?: NavigateOptions) => {
      router.replace(href, options);
    },
    [router],
  );

  const back = useCallback(() => {
    router.back();
  }, [router]);

  return useMemo(
    () => ({
      push,
      replace,
      back,
    }),
    [push, replace, back],
  );
}
