import Link from 'next/link';

import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';
import { ProductService } from '@/shared/api/product/product.service';
import { getDayBefore } from '@/shared/lib/utils/date';

import ProductThumbnail from '@/entities/product-list/ui/card/ProductThumbnail';

export default async function CommunityDesktopSidebar() {
  let data;
  try {
    data = await ProductService.getProducts({
      limit: 6,
      orderBy: ProductOrderType.CommunityRanking,
      startDate: getDayBefore(3),
      categoryId: null,
      orderOption: OrderOptionType.Desc,
      isEnd: false,
    });
  } catch {
    return null;
  }

  const products = data?.products ?? [];
  if (products.length === 0) return null;

  return (
    <div className="sticky top-20">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="typography-body-14sb text-fg-primary">지름 랭킹</h2>
        <Link
          href="/trending/ranking"
          className="text-fg-secondary hover:text-fg-secondary-strong text-xs"
        >
          더보기
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {products.map((product, i) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="flex flex-col hover:opacity-90"
          >
            <div className="bg-surface-muted relative aspect-square overflow-hidden rounded-xl">
              {product.thumbnail && (
                <ProductThumbnail
                  src={product.thumbnail}
                  alt={product.title}
                  title={product.title}
                  categoryId={product.categoryId}
                  type="product"
                  sizes="128px"
                />
              )}
              <span
                className={[
                  'absolute top-1.5 left-1.5 text-sm font-bold drop-shadow',
                  i === 0
                    ? 'text-red-500'
                    : i === 1
                      ? 'text-orange-400'
                      : i === 2
                        ? 'text-yellow-500'
                        : 'text-fg-inverse',
                ].join(' ')}
              >
                {i + 1}
              </span>
            </div>
            <p className="text-fg-primary mt-1.5 line-clamp-2 text-xs leading-tight">
              {product.title}
            </p>
            {product.price && (
              <p className="text-fg-secondary-strong mt-0.5 text-xs font-semibold">
                {product.price}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
