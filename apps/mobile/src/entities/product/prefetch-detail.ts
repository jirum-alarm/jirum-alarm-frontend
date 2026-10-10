import {Image} from 'expo-image';

import {convertToWebp} from '@/shared/lib/format/image';

/**
 * 상세가 기다리는 3개(상품·가이드·가격 판정)와 썸네일을 **카드에 손가락이 닿는 순간** 받기 시작한다.
 *
 * 탭은 누름→뗌 사이 100~200ms 가 비고, 그 뒤 push 애니메이션도 300ms 남짓이다. 이 시간에
 * 미리 받아 두면 상세가 스켈레톤 없이 바로 채워진다(web 의 hover prefetch 와 같은 발상).
 * 기본 staleTime 1분·refetchOnMount false 라 상세가 열려도 다시 요청하지 않는다 — 요청 수는
 * 늘지 않고 시점만 앞당긴다. 이미 신선하면 prefetchQuery 가 아무것도 안 한다.
 *
 * 실패는 삼킨다 — 상세가 열리면 자기 useQuery 가 다시 시도한다.
 *
 * ★쿼리·클라이언트는 호출 시점에 require 한다 — 카드 컴포넌트가 import 만으로 서비스·
 * 스토리지 체인을 끌고 오지 않게(앱 시작 비용·카드 단독 렌더 테스트).
 */
export function prefetchProductDetail(
  id: number,
  thumbnail?: string | null,
): void {
  const {queryClient} =
    require('@/provider/ReactQueryProvider') as typeof import('@/provider/ReactQueryProvider');
  const {ProductQueries} =
    require('./product.queries') as typeof import('./product.queries');
  void queryClient.prefetchQuery(ProductQueries.info({id}));
  void queryClient.prefetchQuery(ProductQueries.guides({productId: id}));
  void queryClient.prefetchQuery(ProductQueries.dealEvidence({id}));
  // 상세 첫 화면을 채우는 건 정사각 대표 이미지다. Thumbnail 과 같은 webp 주소를 데운다.
  const src = convertToWebp(thumbnail) ?? thumbnail;
  // expo-image 캐시에 데운다 — 상세의 Thumbnail(expo-image)이 같은 캐시를 읽는다(RN Image.prefetch 는 다른 캐시라 헛일이었다).
  if (src) Image.prefetch(src, 'memory-disk').catch(() => {});
}
