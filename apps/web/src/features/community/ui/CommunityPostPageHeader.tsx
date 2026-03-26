'use client';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { PAGE } from '@/shared/config/page';
import LogoLink from '@/shared/ui/common/Logo/LogoLink';
import BackButton from '@/shared/ui/layout/BackButton';

import { AuthQueries } from '@/entities/auth';
import { CommunityQueries } from '@/entities/community';

import CommunityShareButton from './CommunityShareButton';
import PostMenu from './PostMenu';

export default function CommunityPostPageHeader({
  postId,
  isUserLogin,
}: {
  postId: number;
  isUserLogin: boolean;
}) {
  const searchParams = useSearchParams();
  const { data: postData } = useSuspenseQuery(CommunityQueries.post(postId));
  const { data: authData } = useQuery(AuthQueries.me());

  const post = postData?.comment;
  const isMyPost = `${post?.author?.id ?? ''}` === `${authData?.me?.id ?? '##'}`;
  const tab = searchParams.get('tab');
  const backTo = tab ? `${PAGE.COMMUNITY}?tab=${tab}` : PAGE.COMMUNITY;

  return (
    <header className="max-w-mobile-max fixed top-0 z-50 flex h-14 w-full items-center justify-between border-b border-gray-100 bg-white px-5">
      <div className="flex items-center gap-x-1">
        <BackButton backTo={backTo} />
        <LogoLink />
      </div>
      <div className="flex items-center gap-x-4">
        <Suspense>
          <CommunityShareButton postId={postId} />
        </Suspense>
        {isUserLogin && <PostMenu postId={postId} isMyPost={isMyPost} />}
      </div>
    </header>
  );
}
