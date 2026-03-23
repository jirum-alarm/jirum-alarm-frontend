'use client';

import Clarity from '@microsoft/clarity';
import { usePathname } from 'next/navigation';
import { env } from 'next-runtime-env';
import { useEffect, useRef } from 'react';

import { getAccessToken } from '@/app/actions/token';

import { QueryMeDocument } from '@/shared/api/gql/graphql';
import { IS_PRD } from '@/shared/config/env';
import { execute } from '@/shared/lib/http-client';

export const ClarityProvider = () => {
  const pathname = usePathname();
  const identifiedUserIdRef = useRef<string | null>(null);
  const clarityProjectId = env('NEXT_PUBLIC_CLARITY_PROJECT_ID') ?? '';

  useEffect(() => {
    if (!IS_PRD || !clarityProjectId) {
      return;
    }

    Clarity.init(clarityProjectId);
  }, [clarityProjectId]);

  useEffect(() => {
    if (!IS_PRD || !clarityProjectId) {
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

        Clarity.identify(userId);
        identifiedUserIdRef.current = userId;
      } catch {
        // Clarity 식별 실패는 사용자 흐름을 막지 않는다.
      }
    };

    identifyUser();

    return () => {
      isUnmounted = true;
    };
  }, [clarityProjectId, pathname]);

  return null;
};
