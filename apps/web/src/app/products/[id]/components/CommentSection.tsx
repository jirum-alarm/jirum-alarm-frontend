'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { CommentQueries, defaultCommentsVariables } from '@/entities/comment';

import Comment from '../comment/components/Comment';

export const CommentSection = ({ productId }: { productId: number }) => {
  return (
    <section className="px-5">
      <ErrorBoundary
        fallback={
          <p className="py-8 text-center text-sm text-gray-500">댓글을 불러오지 못했습니다.</p>
        }
      >
        <Suspense fallback={<CommentListSkeleton />}>
          <CommentList productId={productId} />
        </Suspense>
      </ErrorBoundary>
    </section>
  );
};

const CommentList = ({ productId }: { productId: number }) => {
  const {
    data: { pages },
  } = useSuspenseInfiniteQuery(
    CommentQueries.infiniteComments({ ...defaultCommentsVariables, productId }),
  );

  return (
    <div className="flex flex-col gap-y-6">
      {pages.map((page) =>
        page.comments.map((comment) => <Comment key={comment.id} comment={comment} canReply />),
      )}
    </div>
  );
};

const CommentListSkeleton = () => {
  return (
    <div className="flex flex-col gap-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-x-3">
          <div className="h-9 w-9 rounded-full bg-gray-100" />
          <div className="flex flex-grow flex-col gap-y-2">
            <div className="h-4 w-1/4 rounded bg-gray-100" />
            <div className="h-4 w-full rounded bg-gray-100" />
            <div className="h-4 w-2/3 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
};
