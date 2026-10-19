'use client';

import { useAtomValue } from 'jotai';
import dynamic from 'next/dynamic';

import { isGuestAtom } from '@/shared/hooks/useIsLoggedIn';
import { pushChannelSheetAtom } from '@/shared/lib/push-channel/pushChannel';
import { loginModalMessageAtom } from '@/shared/model/loginModal';

/**
 * 루트에 늘 달려 있지만 대부분의 방문에서 한 번도 안 열리는 모달.
 * 본문(AlertDialog·로그인 훅·QR)을 모든 라우트 첫 JS 에 싣지 않게, 열림 atom 만 보고 열릴 때 받는다.
 */
const LoginModal = dynamic(() => import('@/features/auth/ui/login/LoginModal'), { ssr: false });
const PushChannelSheet = dynamic(() => import('@/features/app-download/ui/PushChannelSheet'), {
  ssr: false,
});
const GuestAlertReturnToast = dynamic(() => import('@/features/alarm/ui/GuestAlertReturnToast'), {
  ssr: false,
});

export function LazyLoginModal() {
  return useAtomValue(loginModalMessageAtom) === null ? null : <LoginModal />;
}

export function LazyPushChannelSheet() {
  return useAtomValue(pushChannelSheetAtom) ? <PushChannelSheet /> : null;
}

/** 게스트(로그인 없이 키워드를 건 브라우저)만 — 다시 왔을 때 쌓인 알림을 알려 준다. 회원은 종·하단 탭 점이 있다. */
export function LazyGuestAlertReturnToast() {
  return useAtomValue(isGuestAtom) ? <GuestAlertReturnToast /> : null;
}
