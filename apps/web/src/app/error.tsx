'use client'; // Error components must be Client Components

import { ApolloError } from '@apollo/client';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

import ServerError from '@/components/ServerError';
import ApiError from '@/lib/api-error';
import { SentryLevel } from '@/lib/sentry';

export default function Error({
  error,
  reset,
}: {
  error: (Error & { digest?: string }) | ApolloError;
  reset: () => void;
}) {
  useEffect(() => {
    if (error instanceof ApolloError) {
      const apiError = new ApiError(error);
      const errorLevel =
        apiError.name === 'ApiInternalServerError' ? SentryLevel.Fatal : SentryLevel.Error;
      Sentry.withScope((scope) => {
        scope.setLevel(errorLevel);
        scope.setTag('api', apiError.name);
        Sentry.captureException(apiError);
      });
    } else {
      Sentry.captureException(error);
    }
  }, [error]);

  return <ServerError onClick={() => reset()} />;
}
