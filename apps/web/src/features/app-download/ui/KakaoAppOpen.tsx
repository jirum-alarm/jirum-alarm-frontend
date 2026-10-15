'use client';

import { toast } from '@jirum/design-system/recipes';
import { useAtomValue } from 'jotai';
import { usePathname, useRouter } from 'next/navigation';
import { env } from 'next-runtime-env';
import { useEffect, useRef, useState } from 'react';

import { isJirumAlarmAppUA, isKakaoInAppUA } from '@/shared/config/user-agent';
import { isGuestAtom, isLoggedInAtom } from '@/shared/hooks/useIsLoggedIn';
import { cn } from '@/shared/lib/cn';
import {
  APP_MISSING_PARAM,
  appOpenUrl,
  closeKakaoBrowserUrl,
  KAKAO_APP_ATTEMPT_EVENT,
  kakaoPlatform,
  type KakaoPlatform,
  markInvited,
  readPref,
  recordIosFailure,
  recordOpenSuccess,
  shouldAutoOpen,
  shouldInvite,
  writePref,
} from '@/shared/lib/kakao-app-open';

import OpenInAppLink from './OpenInAppLink';

/**
 * 첫 방문 시트를 이미 지난 기기 표시 — FirstVisitAppAlertModal FIRST_VISIT_SEEN_KEY · FirstVisitAlertSheet 숨김 실험 군.
 * import 하지 않는 이유: 그 모듈이 motion·vaul 을 끌고 와 모든 페이지(이 컴포넌트는 루트에 달린다) 첫 로드 JS 가 는다.
 */
const FIRST_VISIT_DONE_KEYS = ['jirum:app-alert-hook-seen', 'jirum:fv-holdout-recorded'];

/** 페이지가 뜨자마자 앱 이동을 걸고 이만큼 지나도 페이지가 보이면 카톡이 막은 것 → 누르는 띠로. */
const AUTO_BLOCKED_MS = 1200;
/** 띠를 누르고(사용자 탭) 이만큼 지나도 페이지가 보이면 iOS 는 앱이 없는 것. */
const IOS_OPEN_TIMEOUT_MS = 2500;

type Bar =
  | { kind: 'invite' }
  | { kind: 'tap'; href: string }
  | { kind: 'confirm' }
  | { kind: 'opened' }
  | { kind: 'off' }
  | { kind: 'missing' };

const track = (action: string, platform: KakaoPlatform) =>
  (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
    event: 'kakao_app_open',
    action,
    platform,
  });

const hasItem = (store: Storage | null, key: string): boolean => {
  try {
    return store?.getItem(key) != null;
  } catch {
    return false;
  }
};

const storage = (): Storage | null => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

/**
 * 카톡 링크를 앱으로 바로 열기 — 규칙·이유는 shared/lib/kakao-app-open.ts.
 *
 * 하는 일(카톡 인앱 안에서만):
 * 1. 「바로 열기」를 켠 기기면 페이지가 뜨자마자 앱으로 넘긴다. 돌아오면 「채팅으로 돌아가기 · 자동 열기 끄기」.
 * 2. 아직 안 정한 기기엔 앱 화면 위에 한 번 「앱이 있다면 카톡 링크를 앱으로 바로」 띠.
 * 3. 띠든 상세 헤더든 「앱에서 열기」를 누르고 돌아오면 「다음부터 바로 열까요?」 — 네면 켠다.
 * 4. 안드로이드 intent 가 앱을 못 찾고 돌아오면(kakao_app=missing) 끈다.
 * 첫 로드에만 판단한다(카톡 안에서 화면을 옮겨 다닐 때마다 튕기지 않게).
 */
export default function KakaoAppOpen() {
  const pathname = usePathname();
  const router = useRouter();
  const isGuest = useAtomValue(isGuestAtom);
  const isLoggedIn = useAtomValue(isLoggedInAtom);
  const [bar, setBar] = useState<Bar | null>(null);
  const [platform, setPlatform] = useState<KakaoPlatform | null>(null);
  const decided = useRef(false);

  // 1·2·4 — 첫 로드에 한 번.
  useEffect(() => {
    if (decided.current) return;
    decided.current = true;
    const ua = navigator.userAgent;
    const kakaoInApp = isKakaoInAppUA(ua);
    const jirumApp = isJirumAlarmAppUA(ua);
    const os = kakaoPlatform(ua);
    const on = env('NEXT_PUBLIC_KAKAO_APP_OPEN')?.trim() !== 'off';
    if (!on || !kakaoInApp || jirumApp || !os) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- UA·저장소는 브라우저에만 있다.
    setPlatform(os);
    const store = storage();
    const { search } = window.location;

    if (new URLSearchParams(search).has(APP_MISSING_PARAM)) {
      writePref(store, 'off');
      track('missing', os);
      setBar({ kind: 'missing' });
      const params = new URLSearchParams(search);
      params.delete(APP_MISSING_PARAM);
      const rest = params.toString();
      router.replace(`${window.location.pathname}${rest ? `?${rest}` : ''}`, { scroll: false });
      return;
    }

    const pref = readPref(store);
    if (shouldAutoOpen({ on, kakaoInApp, jirumApp, platform: os, path: pathname, pref, search })) {
      track('auto', os);
      const gd = guestDeviceId(isGuest && !isLoggedIn);
      let hidden = false;
      const onVisibility = () => {
        if (document.visibilityState === 'hidden') {
          hidden = true;
          recordOpenSuccess(store);
        } else if (hidden) {
          setBar({ kind: 'opened' });
          document.removeEventListener('visibilitychange', onVisibility);
        }
      };
      document.addEventListener('visibilitychange', onVisibility);
      const href = appOpenUrl(os, pathname, 'kakao_auto', window.location.origin, gd);
      window.location.href = href;
      // 카톡 iOS 는 사용자 탭 없는 스킴 이동을 조용히 막는다(10/15 실기기 — 「앱에서 열기」 탭은 열리는데 자동은 안 열림).
      // 막혔으면 앱이 없는 게 아니다 — 끄지 말고 한 번 누르면 되는 띠를 띄운다. 누른 뒤에도 안 열려야 «없음».
      window.setTimeout(() => {
        if (hidden || document.visibilityState !== 'visible') return;
        track('auto_blocked', os);
        setBar({ kind: 'tap', href });
      }, AUTO_BLOCKED_MS);
      return;
    }

    if (
      shouldInvite({
        on,
        kakaoInApp,
        jirumApp,
        platform: os,
        path: pathname,
        pref,
        storage: store,
        firstVisitDone: FIRST_VISIT_DONE_KEYS.some((key) => hasItem(store, key)),
      })
    ) {
      markInvited(store);
      track('invite_view', os);
      setBar({ kind: 'invite' });
    }
    // pathname 은 첫 로드 값만 본다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3 — 「앱에서 열기」를 누르고(가려졌다가) 돌아오면 묻는다. 이미 정한 기기는 묻지 않는다.
  useEffect(() => {
    if (!platform) return;
    const onAttempt = () => {
      if (readPref(storage()) !== null) return;
      track('attempt', platform);
      let hidden = false;
      const onVisibility = () => {
        if (document.visibilityState === 'hidden') {
          hidden = true;
          return;
        }
        if (!hidden) return;
        document.removeEventListener('visibilitychange', onVisibility);
        setBar({ kind: 'confirm' });
      };
      document.addEventListener('visibilitychange', onVisibility);
      // 앱도 스토어도 안 열렸으면 기다리지 않는다.
      window.setTimeout(() => {
        if (!hidden) document.removeEventListener('visibilitychange', onVisibility);
      }, 10_000);
    };
    window.addEventListener(KAKAO_APP_ATTEMPT_EVENT, onAttempt);
    return () => window.removeEventListener(KAKAO_APP_ATTEMPT_EVENT, onAttempt);
  }, [platform]);

  if (!bar || !platform) return null;

  const close = () => setBar(null);
  const setPref = (pref: 'on' | 'off', action: string) => {
    writePref(storage(), pref);
    track(action, platform);
    setBar(pref === 'off' ? { kind: 'off' } : null);
  };

  const onTap = () => {
    track('tap', platform);
    if (platform !== 'ios') return; // 안드로이드는 intent fallback(kakao_app=missing)이 판정한다.
    const store = storage();
    let hidden = false;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') hidden = true;
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.setTimeout(() => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (hidden) {
        recordOpenSuccess(store);
        return;
      }
      track('ios_fail', platform);
      if (recordIosFailure(store)) setBar({ kind: 'missing' });
    }, IOS_OPEN_TIMEOUT_MS);
  };

  const content = (() => {
    switch (bar.kind) {
      case 'tap':
        return (
          <>
            <p className={cn(toast.text, 'flex-1')}>이 상품을 앱에서 볼까요?</p>
            <a href={bar.href} className={cn(toast.action, 'whitespace-nowrap')} onClick={onTap}>
              앱에서 열기
            </a>
            <CloseButton onClick={close} />
          </>
        );
      case 'invite':
        return (
          <>
            <p className={cn(toast.text, 'flex-1')}>
              앱이 있다면, 카톡 링크를 앱으로 바로 열 수 있어요
            </p>
            <OpenInAppLink
              platform={platform === 'ios' ? 'apple' : 'android'}
              path={pathname}
              source="kakao_invite"
              iosUniversalLink
              className={cn(toast.action, 'whitespace-nowrap')}
              onClick={close}
            >
              앱에서 열기
            </OpenInAppLink>
            <CloseButton onClick={close} />
          </>
        );
      case 'confirm':
        return (
          <>
            <p className={cn(toast.text, 'flex-1')}>
              앱에서 잘 열렸나요? 다음부터 카톡 링크를 앱으로 바로 열어 드릴게요
            </p>
            <button type="button" className={toast.action} onClick={() => setPref('on', 'opt_in')}>
              바로 열기
            </button>
            <button
              type="button"
              className={cn(toast.text, 'text-fixed-400 whitespace-nowrap')}
              onClick={() => setPref('off', 'opt_out')}
            >
              아니요
            </button>
          </>
        );
      case 'opened':
        return (
          <>
            <p className={cn(toast.text, 'flex-1')}>앱에서 열었어요</p>
            <a
              href={closeKakaoBrowserUrl(platform)}
              className={cn(toast.action, 'whitespace-nowrap')}
              onClick={() => track('back_to_chat', platform)}
            >
              채팅으로
            </a>
            <button
              type="button"
              className={cn(toast.text, 'text-fixed-400 whitespace-nowrap')}
              onClick={() => setPref('off', 'turn_off')}
            >
              자동 열기 끄기
            </button>
          </>
        );
      case 'off':
        return (
          <>
            <p className={cn(toast.text, 'flex-1')}>카톡 링크를 여기서 볼게요</p>
            <CloseButton onClick={close} />
          </>
        );
      case 'missing':
        return (
          <>
            <p className={cn(toast.text, 'flex-1')}>
              앱이 없어서 여기서 열었어요. 자동 열기를 껐어요
            </p>
            <CloseButton onClick={close} />
          </>
        );
    }
  })();

  return (
    <div
      role="status"
      className={cn(
        toast.box,
        'fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+88px)] z-50 mx-auto flex max-w-[600px] items-center gap-3 break-keep',
      )}
    >
      {content}
    </div>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="닫기"
      className={cn(toast.text, 'text-fixed-400 -m-2 p-2')}
      onClick={onClick}
    >
      ✕
    </button>
  );
}

/** 웹 게스트면 게스트를 만든 기기 id — 앱이 같은 게스트를 이어받는다(OpenInAppLink 와 같은 키). */
function guestDeviceId(isWebGuest: boolean): string | null {
  if (!isWebGuest) return null;
  try {
    return window.localStorage.getItem('jirum-alarm-device-id');
  } catch {
    return null;
  }
}
