'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { PAGE } from '@/shared/config/page';

import { AuthQueries } from '@/entities/auth';
import { CommunityTab } from '@/entities/community';

import useCommunityViewModel from '../model/useCommunityViewModel';

import CommunityPostCard from './CommunityPostCard';
import NoticePostCard from './NoticePostCard';

export default function CommunityList({ tab }: { tab: CommunityTab }) {
  const { data: authData } = useQuery(AuthQueries.me());
  const isUserLogin = !!authData?.me;
  const { posts, ref, isFetchingNextPage } = useCommunityViewModel(tab);

  if (posts.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-sm">아직 게시글이 없어요.</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col">
      {posts.map((post, i) => {
        if (tab === 'notice') {
          const isNew = i === 0;
          return <NoticePostCard key={post.id} post={post} isNew={isNew} />;
        }
        return <CommunityPostCard key={post.id} post={post} />;
      })}

      {/* 무한 스크롤 트리거 */}
      <div ref={ref} className="h-1" />
      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-4 text-sm text-gray-400">
          불러오는 중...
        </div>
      )}

      {/* 글쓰기 FAB (모바일 전용) */}
      {isUserLogin && (
        <Link
          href={PAGE.COMMUNITY_WRITE}
          className="bg-primary-500 hover:bg-primary-600 active:bg-primary-700 fixed right-5 bottom-20 z-50 flex items-center gap-x-1.5 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-lg md:hidden"
        >
          <span className="text-lg leading-none">+</span>
          <span>글쓰기</span>
        </Link>
      )}
    </div>
  );
}
