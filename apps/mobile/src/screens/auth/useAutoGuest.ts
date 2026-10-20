import {useEffect, useState} from 'react';

import {StorageKey} from '@/shared/constant/storage-key';
import {getAsyncStorage, setAsyncStorage} from '@/shared/lib/persistence';
import {useGuestLogin} from './useGuestLogin';

/** 게스트 발급이 이보다 늦으면 로그인 화면을 보여 준다 — 스플래시에 갇히지 않게. */
const AUTO_GUEST_TIMEOUT_MS = 8000;

/**
 * 첫 실행이면 로그인 화면을 건너뛰고 게스트로 바로 메인에 들어간다.
 *
 * 왜: 앱 첫 화면이 로그인 벽이었다. 2026-09-28~10-11 처음 연 사람 중 가입·게스트로
 * 안으로 들어온 건 소수였다 — 스토어에서 마음먹고 깐 사람을 첫 화면에서 잃었다. 게스트도 키워드
 * 알림을 받고, 나중에 로그인하면 백엔드가 기기 기준으로 계정에 합친다.
 *
 * 로그인 화면이 맞는 경우는 그대로 둔다: 세션이 한 번이라도 있었던 기기(로그아웃·세션 만료·
 * 게스트에서 로그인하러 나감)는 SESSION_EVER 가 있어 자동 진입하지 않는다.
 *
 * @returns pending — 판단·발급 중(스플래시를 유지할 동안) true.
 */
export function useAutoGuest({
  isLoading,
  isLogin,
}: {
  isLoading: boolean;
  isLogin: boolean;
}): {pending: boolean} {
  const {startAutoGuest} = useGuestLogin();
  // null = 아직 모름(저장소 읽는 중), true = 자동 진입 진행 중, false = 할 일 없음.
  const [pending, setPending] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLogin) setAsyncStorage(StorageKey.SESSION_EVER, true).catch(() => {});
  }, [isLogin]);

  useEffect(() => {
    if (isLoading || pending !== null) return;
    if (isLogin) {
      setPending(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const ever = await getAsyncStorage(StorageKey.SESSION_EVER).catch(
        () => null,
      );
      if (cancelled) return;
      if (ever) {
        setPending(false);
        return;
      }
      setPending(true);
      // 실패해도 다시 자동 진입하지 않는다 — 다음 실행은 로그인 화면(「로그인 없이 둘러보기」가 있다).
      await setAsyncStorage(StorageKey.SESSION_EVER, true).catch(() => {});
      const timer = setTimeout(() => setPending(false), AUTO_GUEST_TIMEOUT_MS);
      try {
        await startAutoGuest();
      } catch {
        // useGuestLogin 이 토큰을 정리한다. 로그인 화면으로.
      } finally {
        clearTimeout(timer);
        setPending(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // startAutoGuest 는 렌더마다 새로 만들어진다 — 한 번만 판단하면 되므로 뺀다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isLogin, pending]);

  // 이미 세션이 있으면 기다릴 것 없이 바로 메인(한 프레임도 늦추지 않는다).
  return {pending: !isLogin && pending !== false};
}
