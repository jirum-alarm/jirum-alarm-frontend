import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import Button from '@/components/common/Button';
import { CommentQueries, defaultCommentsVariables } from '@/entities/comment';
import Link from '@/features/Link';

import Comment from '../../comment/components/Comment';

import CommentListSkeleton from './CommentListSkeleton';

const CommentList = ({ productId }: { productId: number }) => {
  const {
    data: { pages },
  } = useSuspenseInfiniteQuery(
    CommentQueries.infiniteComments({ productId, ...defaultCommentsVariables }),
  );

  const comments = pages.flatMap(({ comments }) => comments);

  if (!comments.length) return <CommentListSkeleton productId={productId} />;

  return (
    <>
      <div className="relative flex flex-col">
        <div className="relative flex max-h-[400px] flex-col divide-y divide-gray-200 overflow-hidden">
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} canReply={false} />
          ))}
        </div>
        {comments.length > 1 && (
          <div className="pointer-events-none absolute bottom-0 left-0 h-12 w-full bg-gradient-to-t from-white to-transparent" />
        )}
      </div>
      <div className="mt-5 w-full px-12">
        <Link href={`/products/${productId}/comment`}>
          <Button className="bg-gray-100">댓글 보기</Button>
        </Link>
      </div>
    </>
  );
};

export default CommentList;
