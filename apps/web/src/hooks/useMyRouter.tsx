'use client';

import type { NavigateOptions } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { useDevice } from '@/hooks/useDevice';
import { WebViewBridge, WebViewEventType } from '@/shared/lib/webview';

export default function useMyRouter() {
  const router = useRouter();
  const { isJirumAlarmApp } = useDevice();

  const push = useCallback(
    (href: string, options?: NavigateOptions) => {
      if (isJirumAlarmApp) {
        WebViewBridge.sendMessage(WebViewEventType.ROUTE_CHANGED, {
          data: {
            url: href,
          },
        });
      } else {
        router.push(href, options);
      }
    },
    [router, isJirumAlarmApp],
  );

  const replace = useCallback(
    (href: string, options?: NavigateOptions) => {
      if (isJirumAlarmApp) {
        WebViewBridge.sendMessage(WebViewEventType.ROUTE_CHANGED, {
          data: {
            url: href,
          },
        });
      } else {
        router.replace(href, options);
      }
    },
    [router, isJirumAlarmApp],
  );

  const back = useCallback(() => {
    if (isJirumAlarmApp) {
      WebViewBridge.sendMessage(WebViewEventType.PRESS_BACKBUTTON, null);
    } else {
      router.back();
    }
  }, [router, isJirumAlarmApp]);

  return useMemo(
    () => ({
      push,
      replace,
      back,
    }),
    [push, replace, back], // ✅ 새로운 객체를 안전하게 반환
  );
}
