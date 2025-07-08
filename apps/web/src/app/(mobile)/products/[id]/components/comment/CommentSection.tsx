import { Suspense } from 'react';

import CommentList from './CommentList';
import CommentListSkeleton from './CommentListSkeleton';

const CommentSection = ({ productId }: { productId: number }) => {
  return (
    <section className="mb-10 mt-4 flex flex-col">
      <div className="flex h-[56px] w-full items-center px-5 py-4">
        <span className="text-lg font-bold text-gray-900">지름알림 댓글</span>
      </div>
      <Suspense fallback={<CommentListSkeleton productId={productId} />}>
        <CommentList productId={productId} />
      </Suspense>
    </section>
  );
};

export default CommentSection;
