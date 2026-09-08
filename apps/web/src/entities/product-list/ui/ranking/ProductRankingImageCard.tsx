'use client';

import { m } from 'motion/react';

import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';
import DisplayTime from '@/shared/ui/DisplayTime';
import Link from '@/shared/ui/Link';

import {
  type ProductCardSource,
  productCardTracking,
} from '@/entities/product-list/model/card-tracking';
import { type ProductCardType } from '@/entities/product-list/model/types';
import DisplayListPrice from '@/entities/product-list/ui/card/DisplayListPrice';
import DisplayProductSource from '@/entities/product-list/ui/card/DisplayProductSource';
import ProductThumbnail from '@/entities/product-list/ui/card/ProductThumbnail';

export default function ProductRankingImageCard({
  product,
  activeIndex,
  index,
  rank,
  priority,
  source,
}: {
  product: ProductCardType;
  activeIndex: number;
  index: number;
  rank?: number;
  priority?: boolean;
  source?: ProductCardSource;
}) {
  // 첫 화면(priority) 카드만 상세를 통째로 미리 받는다(탭 즉시 전환). 나머지는 뷰포트 프리페치를 끈다 —
  // 상세에 loading.tsx 가 없어 auto 프리페치(레이아웃 조각 ~600B)가 아무것도 안 주는데 서버만 때렸다.
  return (
    <Link
      prefetch={!!priority}
      href={PAGE.DETAIL + '/' + product.id}
      rel="preload"
      {...productCardTracking(source, product.id, rank ?? index + 1)}
    >
      <m.div
        className={cn(
          'pc:h-auto pc:scale-100 pc:border h-[352px] w-full origin-center scale-90 overflow-hidden rounded-lg bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all duration-300',
          activeIndex === index && 'scale-100',
        )}
      >
        <m.div className="h-full w-full" whileTap={{ scale: 0.96 }} transition={{ duration: 0.1 }}>
          <div className="pc:aspect-square pc:h-auto relative h-[240px] w-full bg-gray-50">
            <div className="text-primary-500 pc:text-white pc:bg-gray-600/80 absolute top-0 left-0 z-10 flex h-6.5 w-6.5 items-center justify-center rounded-br-lg bg-gray-900 text-sm font-medium">
              {rank ?? index + 1}
            </div>
            <ProductThumbnail
              src={product.thumbnail ?? ''}
              title={product.title}
              type="product"
              categoryId={product.categoryId}
              alt={product.title}
              sizes="252px"
              priority={priority}
              quality={priority ? 85 : 75}
            />
          </div>
          <div className="pc:h-[132px] p-3 pb-0">
            <div className="xl:pc:text-base line-clamp-2 text-sm text-gray-700">
              {product.title}
            </div>
            <DisplayProductSource
              mallName={product.mallName}
              provider={product.provider}
              time={product.postedAt ? <DisplayTime time={product.postedAt} /> : undefined}
              className="pt-1"
            />
            <div className="pc:h-[36px] pc:pt-0.5 xl:pc:text-[22px] pt-2 text-lg font-bold text-gray-900">
              <DisplayListPrice price={product.price} />
            </div>
          </div>
        </m.div>
      </m.div>
    </Link>
  );
}
