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
  iosAutoOpenUrl,
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

import { watchAppSwitch } from '../lib/watchAppSwitch';
import { appStoreUrl } from '../model/appHandoff';

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

/**
 * 「앱에서 열기」를 누른 시각 — 돌아왔을 때 「다음부터 바로 열까요?」를 띄울 근거. 메모리가 아니라 저장소에 둔다:
 * 카톡 iPhone 은 앱에서 돌아오면 페이지를 다시 불러올 수 있고(그러면 메모리의 대기가 사라진다), 가려짐 이벤트도 안 보낸다
 * (10/15 실기기 — 두 번 고쳐도 확인 띠가 안 떴다). 그래서 «돌아옴»을 감지하지 않고, 누른 직후부터 띠를 깔아 두고 다시 불러와도
 * 10분 안이면 다시 띄운다.
 */
const ASK_KEY = 'jirum:kakao-app-open-ask';
const ASK_TTL_MS = 10 * 60_000;
/** 진단: 주소 끝에 #kakao-debug 를 붙이면 판정 값과 최근 동작을 화면에 보여 준다(실기기 카톡에서 원인 찾기용). */
const DEBUG_LOG_KEY = 'jirum:kakao-app-open-log';

const track = (action: string, platform: KakaoPlatform) => {
  (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
    event: 'kakao_app_open',
    action,
    platform,
  });
  try {
    const log = JSON.parse(window.sessionStorage.getItem(DEBUG_LOG_KEY) ?? '[]') as string[];
    log.push(`${new Date().toTimeString().slice(0, 8)} ${action}`);
    window.sessionStorage.setItem(DEBUG_LOG_KEY, JSON.stringify(log.slice(-8)));
  } catch {
    // 진단 기록은 없어도 된다.
  }
};

const askPending = (store: Storage | null): boolean => {
  try {
    const at = Number(store?.getItem(ASK_KEY) ?? 0);
    return at > 0 && Date.now() - at < ASK_TTL_MS;
  } catch {
    return false;
  }
};

const setAsk = (store: Storage | null, on: boolean) => {
  try {
    if (on) store?.setItem(ASK_KEY, String(Date.now()));
    else store?.removeItem(ASK_KEY);
  } catch {
    // 저장소를 못 쓰면 이번 화면에서만 묻는다.
  }
};

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
    // 「앱에서 열기」를 누르고 돌아왔는데 페이지가 다시 불렸다 — 묻던 것을 이어서 묻는다.
    if (pref !== 'on' && askPending(store)) {
      track('confirm_view', os);
      setBar({ kind: 'confirm' });
      return;
    }
    if (shouldAutoOpen({ on, kakaoInApp, jirumApp, platform: os, path: pathname, pref, search })) {
      track('auto', os);
      const gd = guestDeviceId(isGuest && !isLoggedIn);
      // 띠의 탭은 앱 스킴(탭이면 카톡이 넘긴다), 자동은 iOS 만 카톡 외부 열기 + 유니버설 링크(iosAutoOpenUrl).
      const href = appOpenUrl(os, pathname, 'kakao_auto', window.location.origin, gd);
      // 카톡 iOS 는 사용자 탭 없는 스킴 이동을 조용히 막는다(10/15 실기기 — 「앱에서 열기」 탭은 열리는데 자동은 안 열림).
      // 막혔으면 앱이 없는 게 아니다 — 끄지 말고 한 번 누르면 되는 띠를 띄운다. 누른 뒤에도 안 열려야 «없음».
      watchAppSwitch({
        windowMs: AUTO_BLOCKED_MS,
        onReturn: () => {
          recordOpenSuccess(store);
          setBar({ kind: 'opened' });
        },
        onStay: () => {
          track('auto_blocked', os);
          setBar({ kind: 'tap', href });
        },
      });
      window.location.href = os === 'ios' ? iosAutoOpenUrl(pathname, 'kakao_auto', gd) : href;
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

  // 3 — 「앱에서 열기」를 누르고(가려졌다가) 돌아오면 묻는다. 이미 켠 기기만 묻지 않는다 — 꺼진 기기(아니요·앱 없음 판정)도
  // 스스로 앱 열기를 눌렀으면 다시 묻는다. v1.110.0 은 카톡이 막은 자동 이동을 «앱 없음»으로 세어 꺼 버렸다(10/15 실기기).
  useEffect(() => {
    if (!platform) return;
    const onAttempt = () => {
      if (readPref(storage()) === 'on') return;
      track('attempt', platform);
      // 돌아옴을 감지하지 않는다(ASK_KEY 설명) — 누른 직후 띠를 깔아 두면 앱에서 돌아왔을 때 그대로 보인다.
      // 앱이 없으면 스토어로 넘어가 이 띠를 볼 일이 거의 없다.
      setAsk(storage(), true);
      window.setTimeout(() => {
        track('confirm_view', platform);
        setBar({ kind: 'confirm' });
      }, 800);
    };
    window.addEventListener(KAKAO_APP_ATTEMPT_EVENT, onAttempt);
    return () => window.removeEventListener(KAKAO_APP_ATTEMPT_EVENT, onAttempt);
  }, [platform]);

  if (!bar || !platform) return <KakaoDebug />;

  const close = () => setBar(null);
  const setPref = (pref: 'on' | 'off', action: string) => {
    setAsk(storage(), false);
    writePref(storage(), pref);
    track(action, platform);
    setBar(pref === 'off' ? { kind: 'off' } : null);
  };

  const onTap = () => {
    track('tap', platform);
    if (platform !== 'ios') return; // 안드로이드는 intent fallback(kakao_app=missing)이 판정한다.
    const store = storage();
    watchAppSwitch({
      windowMs: IOS_OPEN_TIMEOUT_MS,
      onReturn: () => {
        recordOpenSuccess(store);
        setBar({ kind: 'opened' });
      },
      onStay: () => {
        track('ios_fail', platform);
        if (recordIosFailure(store)) setBar({ kind: 'missing' });
      },
    });
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
              앱이 열렸다면, 다음부터 카톡 링크를 앱으로 바로 열어 드릴게요
            </p>
            <button type="button" className={toast.action} onClick={() => setPref('on', 'opt_in')}>
              바로 열기
            </button>
            {platform === 'ios' ? (
              // 카톡 iPhone 「앱 열기」는 App Store 자동 폴백이 없다(OpenInAppLink) — 앱이 없던 사람은 여기서 받는다.
              <a
                href={appStoreUrl('kakao_invite')}
                className={cn(toast.text, 'text-fixed-400 whitespace-nowrap')}
                onClick={() => {
                  setAsk(storage(), false);
                  track('store', platform);
                }}
              >
                앱 받기
              </a>
            ) : null}
            <button
              type="button"
              aria-label="아니요"
              className={cn(toast.text, 'text-fixed-400 -m-2 p-2')}
              onClick={() => setPref('off', 'opt_out')}
            >
              ✕
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
    <>
      <KakaoDebug />
      <div
        role="status"
        className={cn(
          toast.box,
          'fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+88px)] z-50 mx-auto flex max-w-[600px] items-center gap-3 break-keep',
        )}
      >
        {content}
      </div>
    </>
  );
}

/** #kakao-debug 일 때만 — 카톡 실기기에서 판정 값과 최근 동작을 보여 준다(원인을 찾으려고 화면을 찍어 보내기). */
function KakaoDebug() {
  const [lines, setLines] = useState<string[] | null>(null);
  useEffect(() => {
    if (!window.location.hash.includes('kakao-debug')) return;
    const read = () => {
      const ua = navigator.userAgent;
      const store = storage();
      let log: string[] = [];
      try {
        log = JSON.parse(window.sessionStorage.getItem(DEBUG_LOG_KEY) ?? '[]') as string[];
      } catch {
        // 비어도 된다.
      }
      setLines([
        `kakao=${isKakaoInAppUA(ua)} os=${kakaoPlatform(ua)} jirumApp=${isJirumAlarmAppUA(ua)}`,
        `env=${env('NEXT_PUBLIC_KAKAO_APP_OPEN') ?? '(empty)'} pref=${readPref(store)} ask=${askPending(store)}`,
        `vis=${document.visibilityState} ua=${ua.slice(-60)}`,
        ...log,
      ]);
    };
    read();
    const timer = window.setInterval(read, 1000);
    return () => window.clearInterval(timer);
  }, []);
  if (!lines) return null;
  return (
    <pre className="bg-fixed-900 text-fixed-white pointer-events-none fixed inset-x-0 top-24 z-50 overflow-hidden p-2 text-xs whitespace-pre-wrap opacity-90">
      {lines.join('\n')}
    </pre>
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
