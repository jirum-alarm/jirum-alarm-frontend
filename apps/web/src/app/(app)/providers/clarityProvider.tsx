'use client';

import Clarity from '@microsoft/clarity';
import { useQuery } from '@tanstack/react-query';
import { env } from 'next-runtime-env';
import { useEffect } from 'react';

import { QueryMeDocument } from '@/shared/api/gql/graphql';
import { IS_PRD } from '@/shared/config/env';
import useIsLoggedIn from '@/shared/hooks/useIsLoggedIn';
import { execute } from '@/shared/lib/http-client';

/**
 * Clarity 초기화 + 로그인 유저 identify.
 *
 * 예전엔 프로바이더 2개가 각각 라우트마다 getAccessToken 서버액션(POST) + me 쿼리를 날렸다
 * (페이지당 왕복 4회, 그것도 Jotai/react-query 바깥이라 캐시 없이). 로그인 여부는
 * ServerStateProvider 가 심은 atom 에 이미 있고, me 는 react-query 로 한 번만 받는다.
 * dataLayer 의 `identify` 이벤트는 GTM 태그(GA4 user_id 등)가 쓸 수 있게 남긴다.
 */
export const ClarityProvider = () => {
  const clarityProjectId = env('NEXT_PUBLIC_CLARITY_PROJECT_ID') ?? '';
  const { isLoggedIn } = useIsLoggedIn();

  useEffect(() => {
    if (!IS_PRD || !clarityProjectId) return;
    Clarity.init(clarityProjectId);
  }, [clarityProjectId]);

  const { data: userId } = useQuery({
    queryKey: ['me', 'id'],
    queryFn: async () => (await execute(QueryMeDocument))?.data?.me?.id ?? null,
    enabled: IS_PRD && isLoggedIn,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!userId) return;
    if (clarityProjectId) Clarity.identify(userId);
    (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
      event: 'identify',
      user_id: userId,
    });
  }, [userId, clarityProjectId]);

  return null;
};
