'use client';

import { Suspense } from 'react';

import ApiErrorBoundary from '@/components/ApiErrorBoundary';
import { LoadingSpinner } from '@/components/common/icons';

import CommentLayout from './CommentLayout';

export default function CommentContainer({
  productId,
  isUserLogin,
}: {
  productId: number;
  isUserLogin: boolean;
}) {
  return (
    <ApiErrorBoundary>
      <Suspense fallback={<Loading />}>
        <CommentLayout productId={productId} isUserLogin={isUserLogin} />
      </Suspense>
    </ApiErrorBoundary>
  );
}

const Loading = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <LoadingSpinner />
    </div>
  );
};
