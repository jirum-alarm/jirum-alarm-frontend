import Image from 'next/image';
import Link from 'next/link';

import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';
import { ProductService } from '@/shared/api/product/product.service';
import { getDayBefore } from '@/shared/lib/utils/date';

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
        <h2 className="text-sm font-semibold text-gray-900">지름 랭킹</h2>
        <Link href="/trending/ranking" className="text-xs text-gray-500 hover:text-gray-700">
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
            <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
              {product.thumbnail && (
                <Image
                  src={product.thumbnail}
                  alt={product.title}
                  fill
                  className="object-cover"
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
                        : 'text-white',
                ].join(' ')}
              >
                {i + 1}
              </span>
            </div>
            <p className="mt-1.5 line-clamp-2 text-xs leading-tight text-gray-900">
              {product.title}
            </p>
            {product.price && (
              <p className="mt-0.5 text-xs font-semibold text-gray-700">{product.price}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
