'use client';

import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';

import { WebViewBridge } from '@/shared/lib/webview/sender';
import { WebViewEventType } from '@/shared/lib/webview/type';

import customerService from './customer-service';

const isBootedAtom = atom(false);

// SDK onShow/onHide 콜백이 Release 빌드 WebView에서 누락되는 케이스가 있어
// 메신저 DOM 가시성을 직접 관찰해 native tab bar 토글 시그널을 보냄.
function isMessengerVisible() {
  const root = document.getElementById('ch-plugin');
  if (!root) return false;
  const messenger = root.querySelector(
    'iframe[src*="channel.io"], [class*="Messenger"]:not([class*="Launcher"])',
  ) as HTMLElement | null;
  if (!messenger) return false;
  return messenger.offsetParent !== null;
}

const CustomerServiceBoot = () => {
  const [isBooted, setIsBooted] = useAtom(isBootedAtom);

  useEffect(() => {
    if (typeof window === 'undefined' || isBooted) return;
    setIsBooted(true);
    customerService.onBootStrap();
  }, [isBooted, setIsBooted]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let lastOpen = false;
    const emit = () => {
      const open = isMessengerVisible();
      if (open === lastOpen) return;
      lastOpen = open;
      WebViewBridge.sendMessage(WebViewEventType.CHANNEL_TALK_VISIBILITY, {
        data: { isOpen: open },
      });
    };
    const observer = new MutationObserver(emit);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });
    const interval = window.setInterval(emit, 500);
    return () => {
      observer.disconnect();
      window.clearInterval(interval);
    };
  }, []);

  return null;
};

export default CustomerServiceBoot;
