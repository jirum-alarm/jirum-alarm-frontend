'use client';

import { cardThumb, text } from '@jirum/design-system/recipes';

import type { KeywordBoardDeal } from '@/shared/api/keyword';
import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';
import DisplayTime from '@/shared/ui/DisplayTime';
import Link from '@/shared/ui/Link';

import { productCardTracking } from '@/entities/product-list/model/card-tracking';
import DisplayListPrice from '@/entities/product-list/ui/card/DisplayListPrice';
import ProductThumbnail from '@/entities/product-list/ui/card/ProductThumbnail';
import { ProductCardStatus } from '@/entities/product-list/ui/ProductCardStatus';

/**
 * 키워드 카드 안 최근 딜 한 줄 — 목록 카드(ListProductCard)와 같은 76px 사진 — 64 에선 「평소보다 12%↓」 배지가 잘렸다(하네스 10/23). 1년 최저가·기준가 대비·판매종료 표시는
 * ProductCardStatus 한 곳(카드마다 다르게 그리면 버그로 읽힌다). 앱 features/keyword-board/ui/KeywordDealRow 와 짝.
 */
export default function KeywordDealRow({ deal }: { deal: KeywordBoardDeal }) {
  const product = { ...deal, postedAt: new Date(deal.postedAt) };
  return (
    <Link
      href={`${PAGE.DETAIL}/${deal.id}`}
      className="flex items-center gap-3 py-2"
      {...productCardTracking('keyword_tab', deal.id)}
    >
      <div className={cn('relative h-19 w-19 shrink-0', cardThumb)}>
        <ProductThumbnail
          src={deal.thumbnail ?? ''}
          title={deal.title}
          categoryId={deal.categoryId}
          type="product"
          alt={deal.title}
          sizes="76px"
        />
        <ProductCardStatus product={product} showHotdealBadge={false} compact />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn(text.body, 'line-clamp-2 break-all', deal.isEnd && 'text-gray-500')}>
          {deal.title}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <DisplayListPrice price={deal.price} />
          <span className={text.caption}>
            <DisplayTime time={product.postedAt} />
          </span>
        </div>
      </div>
    </Link>
  );
}
