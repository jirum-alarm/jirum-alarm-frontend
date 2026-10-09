'use client';

import { atom, useAtom, useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';

import { getAccessToken } from '@/app/actions/token';

/**
 * 로그인 여부. ServerStateProvider 가 서버 판정 결과를 심는다.
 *
 * ⚠️ 토큰 문자열이 아니라 불리언만 둔다. ACCESS_TOKEN 쿠키는 httpOnly 라
 * 브라우저 JS 가 못 읽는 값인데, 이걸 하이드레이션 페이로드로 내려보내면
 * HTML 평문으로 노출돼 httpOnly 를 무의미하게 만든다. 소비자 7곳 모두
 * 불리언만 쓴다(토큰 값이 필요한 곳은 shared/model/session 의 별도 atom).
 */
export const isLoggedInAtom = atom(false);

/**
 * 게스트 — 로그인 없이 키워드 알림만 받는 기기 계정(IS_GUEST 쿠키). isLoggedIn 은 false 그대로라
 * 회원 UI(프로필·댓글·찜·로그아웃)는 비회원으로 그린다. 키워드·관심사 쪽만 이 값을 함께 본다.
 */
export const isGuestAtom = atom(false);

/** 서버값이 심겼는지. 심겼으면 Server Action 왕복을 건너뛴다. */
export const isAuthResolvedAtom = atom(false);

const useIsLoggedIn = () => {
  const [isLoggedIn, setIsLoggedIn] = useAtom(isLoggedInAtom);
  const isResolved = useAtomValue(isAuthResolvedAtom);
  const [isFetching, setIsFetching] = useState(false);

  // ponytail: 서버값이 없을 때만(Provider 밖) 왕복한다.
  useEffect(() => {
    if (isResolved) return;

    let cancelled = false;
    const fetchAccessToken = async () => {
      setIsFetching(true);
      try {
        const token = await getAccessToken();
        if (!cancelled) setIsLoggedIn(!!token);
      } catch (error) {
        console.error('Failed to fetch access token:', error);
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    };
    fetchAccessToken();

    return () => {
      cancelled = true;
    };
  }, [isResolved, setIsLoggedIn]);

  const isLoading = !isResolved && isFetching;

  return { isLoggedIn: !isLoading && isLoggedIn, isLoading };
};

export default useIsLoggedIn;
