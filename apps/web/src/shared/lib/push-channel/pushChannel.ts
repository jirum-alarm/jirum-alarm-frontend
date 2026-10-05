'use client';

import { atom, useSetAtom } from 'jotai';
import { useCallback } from 'react';

import { isInApp } from '@/shared/lib/webview';

export type PushStatus = 'ok' | 'unsupported' | 'denied' | 'default';

/** 이 브라우저로 푸시를 받을 수 있는지. 앱 웹뷰는 네이티브 토큰으로 받는다. */
export const readPushStatus = (): PushStatus => {
  if (isInApp()) return 'ok';
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'ok';
  return Notification.permission;
};

/** 열려 있으면 방금 등록한 것의 이름(키워드·테마). label 이 없으면 일반 문구. */
export const pushChannelSheetAtom = atom<{ label?: string } | null>(null);

const SHOWN_KEY = 'jirum:push-channel-sheet-shown';
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

/**
 * 알림을 등록했는데 받을 통로가 없으면 "어디로 받을까요" 시트를 띄운다.
 *
 * 2026-10-05 실측: 웹에서 가입해 키워드를 등록한 56명 중 42명은 앱도 웹 푸시 권한도 없었다.
 * 등록 직후 브라우저 권한창만 바로 띄우던 때라, 거절하거나(쿨다운 3일) 아이폰 사파리처럼
 * 웹 푸시가 아예 없으면 앱 설치 안내 없이 끝났다. 웹 가입자 중 나중에 앱으로 넘어온 건 2.2%.
 *
 * ponytail: 브라우저 상태만 본다. 앱 토큰이 이미 있는 유저도 웹에서 등록하면 하루 한 번 뜬다
 * (서버에 "앱 토큰 있음" 조회가 없다). 거슬리면 me 에 그 필드를 추가해 여기서 거른다.
 */
export const usePushChannelPrompt = () => {
  const open = useSetAtom(pushChannelSheetAtom);

  return useCallback(
    (label?: string) => {
      if (readPushStatus() === 'ok') return;
      try {
        const shownAt = Number(localStorage.getItem(SHOWN_KEY));
        if (shownAt && Date.now() - shownAt < COOLDOWN_MS) return;
        localStorage.setItem(SHOWN_KEY, String(Date.now()));
      } catch {
        // 저장소가 막힌 브라우저 — 쿨다운 없이 띄운다.
      }
      open({ label });
    },
    [open],
  );
};
