import {useQuery} from '@tanstack/react-query';

import {SearchService} from '@/shared/api/search';

/**
 * 키워드 허브 한 곳(허브 화면). 통계는 서버 배치가 6시간마다, 딜 목록은 새 딜이 올라올 때 바뀐다 —
 * 다시 들어올 때 5분 안이면 캐시로 바로 그린다. null = 공개 허브가 아님(화면이 「찾을 수 없어요」).
 * 전역 retry:false 를 되살린다(모바일 네트워크는 자주 튄다 — 검색·홈과 같은 2회).
 */
export const useKeywordHub = (slug: string) =>
  useQuery({
    queryKey: ['keywordHub', slug],
    queryFn: () => SearchService.getKeywordHub(slug),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    enabled: slug.length > 0,
  });
