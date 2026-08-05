import { cn } from '@/shared/lib/cn';

import { type ProductCardType } from '@/entities/product-list/model/types';

/**
 * 카드의 "판매처 · 제보 커뮤니티" 메타 한 줄.
 *
 * mallName(판매처)과 provider.nameKr(제보 커뮤니티)은 의미가 다르고 실측상 전 표본이
 * 불일치한다(롯데온 vs 에펨코리아). 상세 페이지처럼 `mallName || provider` 로 폴백하면
 * "판매처" 자리에 커뮤니티 이름이 들어가므로 각각 독립 슬롯으로 둔다.
 *
 * 커버리지가 달라서 노출 범위도 다르다:
 * - provider: 홈 SDUI 5개 쿼리 전부가 이미 select 중 → 전 카드 공통 노출 가능
 * - mallName: `products` 쿼리에만 있고(나머지는 codegen 봉쇄로 추가 불가) 전수 ~70%
 * 그래서 mall 이 없으면 자리표시자 없이 슬롯을 생략한다 — 커뮤니티만 남아도 줄은 성립한다.
 *
 * time 은 문자열로 받는다(카드마다 DisplayTime/formatDateToMMD 포맷이 달라 상위에서 결정).
 */
export default function DisplayProductSource({
  mallName,
  provider,
  time,
  className,
}: Pick<ProductCardType, 'mallName' | 'provider'> & {
  time?: React.ReactNode;
  className?: string;
}) {
  const mall = mallName?.trim();
  const community = provider?.nameKr?.trim();

  if (!mall && !community && !time) return null;

  return (
    <div
      className={cn('flex min-w-0 items-center gap-1 text-xs text-gray-500', className)}
      // 스크린리더는 "쿠팡 맘이베베"를 연속된 고유명사로 읽는다. 짧은 라벨로 역할만 구분.
      aria-label={[mall && `판매처 ${mall}`, community && `${community} 제보`]
        .filter(Boolean)
        .join(', ')}
    >
      {mall && <span className="truncate font-medium text-gray-600">{mall}</span>}
      {mall && community && <span className="shrink-0 text-gray-300">·</span>}
      {community && <span className="truncate">{community}</span>}
      {time && (
        <>
          {(mall || community) && <span className="shrink-0 text-gray-300">·</span>}
          <span className="shrink-0 whitespace-nowrap">{time}</span>
        </>
      )}
    </div>
  );
}
