import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { getAccessToken } from '@/app/actions/token';
import BasicLayout from '@/components/layout/BasicLayout';

import { CommentQueries, defaultCommentsVariables } from '@entities/comment';

import CommentContainer from './CommentContainer';
import CommentPageHeader from './CommentPageHeader';

const CommentContainerServer = async ({ productId }: { productId: number }) => {
  const queryClient = new QueryClient();
  const [token] = await Promise.all([
    getAccessToken(),
    queryClient.prefetchInfiniteQuery(
      CommentQueries.infiniteCommentsServer({
        productId,
        ...defaultCommentsVariables,
      }),
    ),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BasicLayout header={<CommentPageHeader productId={productId} />}>
        <div className="flex h-full w-full grow flex-col">
          <CommentContainer productId={productId} isUserLogin={!!token} />
        </div>
      </BasicLayout>
    </HydrationBoundary>
  );
};

export default CommentContainerServer;
