'use client';

import { LoadingSpinner } from '@/shared/ui/icons';
import TopButton from '@/shared/ui/TopButton';

import { useComment } from '@/features/product-comment';
import { Comment } from '@/features/product-comment';
import { CommentInput } from '@/features/product-comment';
import { CommentListSkeleton } from '@/features/product-comment';

export default function CommentLayout({
  productId,
  isUserLogin,
}: {
  productId: number;
  isUserLogin: boolean;
}) {
  const { pages, ref, editingComment, isFetchingNextPage } = useComment(productId);

  const comments = pages.flatMap(({ comments }) => comments);
  return (
    <>
      {comments.length > 0 ? (
        <>
          <main className="flex grow flex-col divide-y divide-gray-200 pt-14 pb-[64px]">
            {comments.map((comment) => {
              const editStatus =
                editingComment?.status === 'update' && editingComment?.comment.id === comment.id
                  ? 'update'
                  : editingComment?.status === 'reply' && editingComment?.comment.id === comment.id
                    ? 'reply'
                    : undefined;
              return (
                <Comment key={comment.id} comment={comment} editStatus={editStatus} canReply />
              );
            })}
          </main>
          <div className="flex w-full items-center justify-center py-6" ref={ref}>
            {isFetchingNextPage && <LoadingSpinner />}
          </div>
        </>
      ) : (
        <CommentListSkeleton />
      )}
      <TopButton />
      <div className="max-w-mobile-max fixed bottom-0 z-40 w-full">
        <CommentInput productId={productId} isUserLogin={isUserLogin} />
      </div>
    </>
  );
}
