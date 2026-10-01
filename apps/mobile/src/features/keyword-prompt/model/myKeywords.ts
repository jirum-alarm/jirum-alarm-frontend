import {useQuery, type QueryClient} from '@tanstack/react-query';

import {MyPageQueries} from '@/entities/mypage';
import {ProductQueries} from '@/entities/product/product.queries';

/**
 * 내 키워드는 캐시가 **두 벌**이다 — 키워드 화면(mypage·keywords)과 상세 권유(user·notificationKeywords).
 * 한쪽에서 등록·삭제하고 한쪽만 무효화하면, 홈 추천 칩으로 등록한 키워드가 키워드 화면에
 * 안 보이는 식으로 어긋난다(추천 칩은 아무것도 무효화하지 않았다). 등록·삭제는 전부 이걸로.
 */
export const invalidateMyKeywords = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({queryKey: MyPageQueries.keys.keywords()}),
    queryClient.invalidateQueries({queryKey: ProductQueries.keys.myKeywords()}),
  ]);

/** 서버는 소문자로 저장한다 — 비교도 소문자·앞뒤 공백 없이. */
export const normalizeKeyword = (keyword: string) =>
  keyword.trim().toLowerCase();

/** 이미 등록한 키워드 집합(정규화). 추천 칩·검색 알림이 "등록됨" 을 미리 보여주는 데 쓴다. */
export function useMyKeywordSet(): Set<string> {
  const {data} = useQuery(MyPageQueries.keywords());
  return new Set((data ?? []).map(k => normalizeKeyword(k.keyword)));
}
