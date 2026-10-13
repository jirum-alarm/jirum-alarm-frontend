import { cardLabel, cardThumb } from '@jirum/design-system/recipes';

import { type BeautyProduct, type HotDealType } from '@/shared/api/products';
import { productPath } from '@/shared/config/beauty';
import { cardTrackingAttrs, type CardTrackingInput } from '@/shared/lib/card-tracking';
import { cn } from '@/shared/lib/cn';
import { formatPrice } from '@/shared/lib/format';
import DisplayTime from '@/shared/ui/DisplayTime';
import ProductThumbnail from '@/shared/ui/ProductThumbnail';
import ServiceLink from '@/shared/ui/ServiceLink';

const HOTDEAL_TEXT: Record<HotDealType, string> = {
  HOT_DEAL: '핫딜',
  SUPER_DEAL: '대박딜',
  ULTRA_DEAL: '초대박딜',
};

/** web shared/ui/HotdealBadge.tsx(card) 와 같은 모양 — 같은 상품이 web·뷰티를 오가며 다르게 보이면 버그로 읽힌다. */
function HotdealBadge({ type }: { type: HotDealType }) {
  return (
    <div
      className={cn(
        'text-fixed-white flex h-6 w-[57px] items-center justify-center rounded-tr-lg rounded-bl-lg text-sm font-semibold',
        /* eslint-disable no-restricted-syntax -- 핫딜 배지 그라데이션 정지점(web·앱 HotdealBadge 와 같은 값) */
        type === 'HOT_DEAL' &&
          'bg-linear-to-r from-[#F19824] from-0% via-[#E15A00] via-51% to-[#E68B13] to-100%',
        type === 'SUPER_DEAL' &&
          'via-error-500 bg-linear-to-r from-[#F76C7C] from-0% via-56% to-[#F76C7C] to-100%',
        type === 'ULTRA_DEAL' &&
          'from-error-500 to-error-500 w-[62px] bg-linear-to-r from-0% via-[#BB0016] via-48% to-100%',
        /* eslint-enable no-restricted-syntax */
      )}
    >
      {HOTDEAL_TEXT[type]}
    </div>
  );
}

/**
 * 뷰티 상품 카드 — web entities/product-list/ui/grid/ProductGridCard 와 같은 모양(사진·순위·상태·제목·판매처·가격).
 * 상세는 본 서비스 `/products/{id}`(basePath 밖)라 일반 <a>. 계측 data-* 는 card-tracking.ts.
 */
export default function ProductCard({
  product,
  tracking,
  priority,
  showTime = true,
}: {
  product: BeautyProduct;
  tracking: Omit<CardTrackingInput, 'productId'>;
  priority?: boolean;
  showTime?: boolean;
}) {
  const mall = product.mallName?.trim();
  const rawCommunity = product.provider?.nameKr?.trim();
  // 몰이 직접 제보하면 판매처·제보처가 같은 이름이다 — 한 번만(web DisplayProductSource 와 같은 규칙).
  const community = rawCommunity === mall ? undefined : rawCommunity;

  return (
    <ServiceLink
      href={productPath(product.id)}
      className="block w-full transition-transform duration-100 active:scale-95"
      {...cardTrackingAttrs({ ...tracking, productId: product.id })}
    >
      <div className={cn('relative aspect-square', cardThumb)}>
        <ProductThumbnail
          src={product.thumbnail}
          alt={product.title}
          sizes="(max-width: 768px) 160px, 252px"
          priority={priority}
        />
        {typeof tracking.rank === 'number' && (
          <div className="text-primary-500 bg-fixed-900 absolute top-0 left-0 z-10 flex h-6.5 w-6.5 items-center justify-center rounded-br-lg text-sm">
            {tracking.rank}
          </div>
        )}
        {product.isEnd ? (
          <div
            className={cn(
              'absolute bottom-0 left-0 z-10 flex items-center',
              cardLabel.corner.box,
              cardLabel.tone.light.box,
              cardLabel.corner.text,
              cardLabel.tone.light.text,
            )}
          >
            판매종료
          </div>
        ) : product.hotDealType ? (
          <div className="absolute bottom-0 left-0 z-10">
            <HotdealBadge type={product.hotDealType} />
          </div>
        ) : null}
      </div>
      <div className="flex flex-col">
        <span className="line-clamp-2 h-12 pt-2 text-sm wrap-break-word text-gray-700">
          {product.title}
        </span>
        {(mall || community || showTime) && (
          <div className="flex min-w-0 items-center gap-1 pt-1 text-xs text-gray-500">
            {mall && <span className="truncate font-medium text-gray-600">{mall}</span>}
            {mall && community && <span className="shrink-0 text-gray-300">·</span>}
            {community && <span className="truncate">{community}</span>}
            {showTime && (
              <>
                {(mall || community) && <span className="shrink-0 text-gray-300">·</span>}
                <span className="shrink-0 whitespace-nowrap">
                  <DisplayTime time={product.postedAt} />
                </span>
              </>
            )}
          </div>
        )}
        <span className="truncate pt-1 text-base font-semibold text-gray-900">
          {formatPrice(product.price)}
        </span>
      </div>
    </ServiceLink>
  );
}

/** 2열(폰)·3열(넓은 폰·태블릿) 그리드 — web ProductGridList 의 모바일 폭 규칙. */
export function ProductGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-3">
      {children}
    </div>
  );
}
