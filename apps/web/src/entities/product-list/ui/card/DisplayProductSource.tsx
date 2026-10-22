import { text } from '@jirum/design-system/recipes';

import { cn } from '@/shared/lib/cn';

import { type ProductCardType } from '@/entities/product-list/model/types';

/**
 * 카드의 "판매처 · 제보 커뮤니티" 메타 한 줄.
 *
 * mallName(판매처)과 provider.nameKr(제보 커뮤니티)은 의미가 다르고 실측상 전 표본이
 * 불일치한다(롯데온 vs 에펨코리아). 상세 페이지처럼 `mallName || provider` 로 폴백하면
 * "판매처" 자리에 커뮤니티 이름이 들어가므로 각각 독립 슬롯으로 둔다.
 *
 * 홈 SDUI 5개 쿼리 모두 mallName·provider 를 select 한다. 다만 mallName 은 상품에 따라
 * 비어 있을 수 있어(다나와 미매칭 등) 없으면 자리표시자 없이 슬롯을 생략한다 —
 * 커뮤니티만 남아도 줄은 성립한다.
 *
 * time 은 문자열로 받는다(카드마다 DisplayTime/formatDateToMMD 포맷이 달라 상위에서 결정).
 */
export default function DisplayProductSource({
  mallName,
  provider,
  postedCommunityCount,
  time,
  className,
  narrow = false,
}: Pick<ProductCardType, 'mallName' | 'provider' | 'postedCommunityCount'> & {
  time?: React.ReactNode;
  className?: string;
  /**
   * 폭이 좁은 카드(가로 캐러셀 120px·3열 그리드)용. 줄이 170px 보다 좁으면 판매처가 있을 때 커뮤니티를 접는다 —
   * 셋을 다 넣으면 판매처·커뮤니티가 둘 다 「롯…」「에…」 한 글자로 잘려 아무것도 못 읽었다(2026-10-15 상세 실측).
   * 줄이 부모 폭을 그대로 받는 카드(flex-col)에서만 켠다 — 컨테이너 쿼리라 내용 폭으로 크기를 정하는 자리에선 0 폭이 된다.
   */
  narrow?: boolean;
}) {
  const mall = mallName?.trim();
  const rawCommunity = provider?.nameKr?.trim();
  // 유통기한 임박 특가처럼 몰이 직접 제보하는 상품은 판매처와 제보처가 같은 이름이다.
  // 그대로 두면 "알토란마켓 · 알토란마켓"으로 같은 값이 두 번 찍히므로 한 번만 보여준다.
  const community = rawCommunity === mall ? undefined : rawCommunity;
  // 같은 딜이 여러 커뮤니티에 올라왔으면 랭킹이 한 칸으로 접고 수를 준다 — 여러 곳이 동시에 올렸다는 것도 좋은 딜의 근거다.
  const otherCommunities = community && postedCommunityCount ? postedCommunityCount - 1 : 0;

  if (!mall && !community && !time) return null;

  // 좁은 줄에서 판매처가 있으면 커뮤니티(와 그 앞 점·「외 N곳」)를 숨긴다.
  const foldable = narrow && mall ? '@max-[170px]:hidden' : undefined;

  return (
    <div
      className={cn(
        text.caption,
        'flex min-w-0 items-center gap-1',
        narrow && '@container',
        className,
      )}
      // 스크린리더는 "쿠팡 맘이베베"를 연속된 고유명사로 읽는다. 짧은 라벨로 역할만 구분.
      aria-label={[
        mall && `판매처 ${mall}`,
        community &&
          (otherCommunities > 0
            ? `${community} 외 ${otherCommunities}곳 제보`
            : `${community} 제보`),
      ]
        .filter(Boolean)
        .join(', ')}
    >
      {mall && <span className="truncate font-medium text-gray-600">{mall}</span>}
      {mall && community && <span className={cn('shrink-0 text-gray-300', foldable)}>·</span>}
      {community && <span className={cn('truncate', foldable)}>{community}</span>}
      {otherCommunities > 0 && (
        <span className={cn('shrink-0 font-medium whitespace-nowrap text-gray-600', foldable)}>
          외 {otherCommunities}곳
        </span>
      )}
      {time && (
        <>
          {(mall || community) && <span className="shrink-0 text-gray-300">·</span>}
          <span className="shrink-0 whitespace-nowrap">{time}</span>
        </>
      )}
    </div>
  );
}
