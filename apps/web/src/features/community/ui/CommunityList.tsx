'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Fragment, useEffect } from 'react';

import { PAGE } from '@/shared/config/page';

import { AuthQueries } from '@/entities/auth';
import { CommunityTab } from '@/entities/community';

import useCommunityViewModel from '../model/useCommunityViewModel';

import CommunityPostCard from './CommunityPostCard';
import NoticePostCard from './NoticePostCard';

interface Props {
  tab: CommunityTab;
  insertAfterIndex?: number;
  insertContent?: React.ReactNode;
}

export default function CommunityList({ tab, insertAfterIndex, insertContent }: Props) {
  const { data: authData } = useQuery(AuthQueries.me());
  const isUserLogin = !!authData?.me;
  const { posts, ref, isFetchingNextPage } = useCommunityViewModel(tab);

  useEffect(() => {
    const scrollKey = `community:scroll:${tab}`;
    const savedScrollY = sessionStorage.getItem(scrollKey);

    if (savedScrollY) {
      requestAnimationFrame(() => {
        window.scrollTo(0, Number(savedScrollY));
      });
    }

    let isTicking = false;

    const saveScrollPosition = () => {
      sessionStorage.setItem(scrollKey, String(window.scrollY));
      isTicking = false;
    };

    const handleScroll = () => {
      if (isTicking) return;
      isTicking = true;
      requestAnimationFrame(saveScrollPosition);
    };

    const handlePageHide = () => {
      sessionStorage.setItem(scrollKey, String(window.scrollY));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pagehide', handlePageHide);
      sessionStorage.setItem(scrollKey, String(window.scrollY));
    };
  }, [tab]);

  if (posts.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-sm">아직 게시글이 없어요.</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {posts.map((post, i) => {
          const card =
            tab === 'notice' ? (
              <NoticePostCard key={post.id} post={post} isNew={i === 0} tab={tab} />
            ) : (
              <CommunityPostCard key={post.id} post={post} tab={tab} />
            );

          if (insertContent && insertAfterIndex !== undefined && i === insertAfterIndex) {
            return (
              <Fragment key={post.id}>
                {card}
                <div className="col-span-full">{insertContent}</div>
              </Fragment>
            );
          }
          return card;
        })}
      </div>

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
          className="bg-primary-500 hover:bg-primary-600 active:bg-primary-700 fixed right-5 z-50 flex items-center gap-x-1.5 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform active:scale-95 md:hidden"
          style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
        >
          <span className="text-lg leading-none">+</span>
          <span>글쓰기</span>
        </Link>
      )}
    </div>
  );
}
