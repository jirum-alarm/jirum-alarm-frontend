import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { Suspense } from 'react';

import { getAccessToken } from '@/app/actions/token';
import Button from '@/components/common/Button';
import withCheckDevice from '@/components/hoc/withCheckDevice';
import DeviceSpecific from '@/components/layout/DeviceSpecific';
import { detailCommentPage } from '@/util/navigation';

import Link from '@shared/ui/Link';

import { CommentQueries, defaultCommentsVariables } from '@entities/comment';

import CommentInput from '../../comment/components/CommentInput';

import CommentList from './CommentList';
import CommentListSkeleton from './CommentListSkeleton';

const CommentListWithDevice = withCheckDevice(CommentList);

export default async function CommentSection({ productId }: { productId: number }) {
  const queryClient = new QueryClient();
  const accessToken = await getAccessToken();
  const isUserLogin = !!accessToken;

  const { pages } = await queryClient.fetchInfiniteQuery(
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
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<CommentListSkeleton />}>
            <CommentListWithDevice productId={productId} />
          </Suspense>
        </HydrationBoundary>
        <DeviceSpecific mobile={renderMobile} desktop={renderDesktop} />
      </>
    </section>
  );
}
