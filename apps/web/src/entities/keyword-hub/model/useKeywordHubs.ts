'use client';

import { useQuery } from '@tanstack/react-query';

import { KeywordHubService } from '@/shared/api/keyword-hub';

/**
 * 공개 키워드 허브 목록(서버 등록부, 70개 안팎). 검색 요약 카드·추천 검색어가 같이 쓴다.
 * 배치가 6시간마다 통계를 바꾸니 세션 동안 한 번이면 된다. 실패하면 카드·칩이 안 보일 뿐 검색은 그대로다.
 */
export const useKeywordHubs = () =>
  useQuery({
    queryKey: ['keywordHubs'],
    queryFn: () => KeywordHubService.getHubsClient(),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: false,
  });
