'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { getAccessToken } from '@/app/actions/token';

import { QueryMeDocument } from '@/shared/api/gql/graphql';
import { IS_PRD } from '@/shared/config/env';
import { execute } from '@/shared/lib/http-client';

// 로그인 유저의 user_id 를 GTM Mixpanel identify 로 흘려보내 익명↔회원 프로필을 병합한다.
// 계측은 코드가 아니라 GTM 이 보내므로(=dataLayer 커스텀 이벤트를 customEvent 트리거가 받음),
// 여기서는 dataLayer 에 identify 이벤트만 push 한다. GTM 쪽 Mixpanel identify 태그는 별도.
// ClarityProvider 의 identify 패턴과 동일: 앱 로드 시 me.id 를 한 번만 조회(ref 로 중복 방지),
// 모든 로그인 경로(이메일 로그인/가입, 카카오/네이버 OAuth)를 한 곳에서 커버한다.
export const MixpanelIdentifyProvider = () => {
  const pathname = usePathname();
  const identifiedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!IS_PRD) {
      return;
    }

    let isUnmounted = false;

    const identifyUser = async () => {
      try {
        const accessToken = await getAccessToken();

        if (!accessToken) {
          identifiedUserIdRef.current = null;
          return;
        }

        if (identifiedUserIdRef.current) {
          return;
        }

        const response = await execute(QueryMeDocument);
        const userId = response?.data?.me?.id;

        if (!userId || isUnmounted) {
          return;
        }

        if (typeof window !== 'undefined') {
          (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
            event: 'identify',
            user_id: userId,
          });
        }
        identifiedUserIdRef.current = userId;
      } catch {
        // identify 실패는 사용자 흐름을 막지 않는다.
      }
    };

    identifyUser();

    return () => {
      isUnmounted = true;
    };
  }, [pathname]);

  return null;
};
