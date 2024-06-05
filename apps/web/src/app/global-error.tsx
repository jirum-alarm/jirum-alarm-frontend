'use client';

import ApiError from '@/lib/api-error';
import { SentryLevel } from '@/lib/sentry';
import { ApolloError } from '@apollo/client';
import * as Sentry from '@sentry/nextjs';
import NextError from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
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
    <html>
      <body>
        {/* This is the default Next.js error component but it doesn't allow omitting the statusCode property yet. */}
        <NextError statusCode={undefined as any} />
      </body>
    </html>
  );
}
