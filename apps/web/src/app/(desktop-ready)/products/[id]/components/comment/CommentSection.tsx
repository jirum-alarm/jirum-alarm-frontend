import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { Suspense } from 'react';

import { checkDevice } from '@/app/actions/agent';
import { getAccessToken } from '@/app/actions/token';
import Button from '@/components/common/Button';
import DeviceSpecific from '@/components/layout/DeviceSpecific';
import { CommentQueries, defaultCommentsVariables } from '@/entities/comment';
import Link from '@/features/Link';
import { AuthService } from '@/shared/api/auth';
import { User } from '@/shared/api/gql/graphql';

import CommentInput from '../../comment/components/CommentInput';

import CommentList from './CommentList';
import CommentListSkeleton from './CommentListSkeleton';

export default async function CommentSection({
  productId,
  isUserLogin,
}: {
  productId: number;
  isUserLogin: boolean;
}) {
  const queryClient = new QueryClient();
  const { isMobile } = await checkDevice();
  const accessToken = await getAccessToken();
  let me: User | undefined;
  if (accessToken) {
    const { me: user } = await AuthService.getMeServer();
    me = user;
  }
  const { pages } = await queryClient.fetchInfiniteQuery(
    CommentQueries.infiniteCommentsServer({
      productId,
      ...defaultCommentsVariables,
    }),
  );
  const comments = pages.flatMap(({ comments }) => comments);
  const hasComments = comments.length > 0;
  return (
    <section className="mb-10 mt-4 flex flex-col pc:my-0">
      <div className="flex h-[56px] w-full items-center px-5 py-4">
        <span className="text-lg font-bold text-gray-900">지름알림 댓글</span>
      </div>
      <>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<CommentListSkeleton />}>
            <CommentList productId={productId} isMobile={isMobile} me={me} />
          </Suspense>
        </HydrationBoundary>
        <DeviceSpecific
          mobile={
            <div className="mt-5 w-full px-12">
              <Link href={`/products/${productId}/comment`}>
                <Button className="bg-gray-100">
                  {hasComments ? '댓글 보기' : '댓글 작성하기'}
                </Button>
              </Link>
            </div>
          }
          desktop={<CommentInput productId={productId} isUserLogin={isUserLogin} />}
        />
      </>
    </section>
  );
}
