'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

import { CommunityQueries, CommunityTab } from '@/entities/community';

export default function useCommunityViewModel(tab: CommunityTab) {
  const {
    data: { pages },
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useSuspenseInfiniteQuery(CommunityQueries.posts(tab));

  const { ref } = useInView({
    onChange(inView) {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  const posts = pages.flatMap((page) => page.comments);

  return {
    posts,
    ref,
    isFetchingNextPage,
  };
}
