'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Suspense } from 'react';

import Button from '@/components/common/Button';
import { detailCommentPage } from '@/util/navigation';

import Link from '@shared/ui/Link';

import { CommentQueries, defaultCommentsVariables } from '@entities/comment';

import CommentInput from '../../comment/components/CommentInput';

import CommentList from './CommentList';
import CommentListSkeleton from './CommentListSkeleton';

export default function CommentSection({
  productId,
  isUserLogin,
  isMobile,
}: {
  productId: number;
  isUserLogin: boolean;
  isMobile: boolean;
}) {
  const {
    data: { pages },
  } = useSuspenseInfiniteQuery(
    CommentQueries.infiniteComments({
      productId,
      ...defaultCommentsVariables,
    }),
  );
  const comments = pages.flatMap(({ comments }) => comments);
  const hasComments = comments.length > 0;

  const renderMobile = () => {
    return (
      <div className="mt-8 w-full px-12">
        <Link href={detailCommentPage(productId)}>
          <Button className="bg-gray-100">{hasComments ? '댓글 보기' : '댓글 작성하기'}</Button>
        </Link>
      </div>
    );
  };

  const renderDesktop = () => {
    return <CommentInput productId={productId} isUserLogin={isUserLogin} />;
  };

  return (
    <section className="pc:my-0 mt-4 mb-10 flex flex-col">
      <div className="flex h-[56px] w-full items-center px-5 py-4">
        <span className="text-lg font-bold text-gray-900">지름알림 댓글</span>
      </div>
      <>
        <Suspense fallback={<CommentListSkeleton />}>
          <CommentList productId={productId} isMobile={isMobile} />
        </Suspense>
        {isMobile ? renderMobile() : renderDesktop()}
      </>
    </section>
  );
}
