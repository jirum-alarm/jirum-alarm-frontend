'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { ApolloError } from '@apollo/client';
import ApiError from '@/lib/api-error';
import { SentryLevel } from '@/lib/sentry';

export default function CustomError({
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

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  );
}
