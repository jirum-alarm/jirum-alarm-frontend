'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { ProductQueries } from '@/entities/product';

// Track B: 같은 상품인데 다나와에 없어 매칭 안 된 글들을, 여러 커뮤니티에서 모아 최저가 비교.
// 백엔드(clusteredProducts)가 FP 방어 2겹(가격 있는 글만 + 2개 이상 커뮤니티일 때만) 후 최저가순으로 줌.
// → 빈 배열이면 안 보임(섹션 자체 숨김). 거짓 최저가 노출 안 함.

type Props = {
  productId: number;
  title?: string;
};

function won(price: number | null, currency: string | null): string {
  if (price == null) return '-';
  if (currency === 'USD') return `$${Math.round(price).toLocaleString()}`;
  return `${Math.round(price).toLocaleString()}원`;
}

export default function ClusteredPriceSection({
  productId,
  title = '다른 커뮤니티 가격 비교',
}: Props) {
  const { data } = useSuspenseQuery(ProductQueries.clusteredProducts({ id: productId }));
  const products = data?.clusteredProducts ?? [];

  if (products.length < 2) return null;

  const prices = products.map((p) => p.parsedPrice).filter((v): v is number => v != null);
  const min = prices.length ? Math.min(...prices) : null;
  const max = prices.length ? Math.max(...prices) : null;
  const savePct = min != null && max != null && max > 0 ? Math.round(((max - min) / max) * 100) : 0;
  const providerCount = new Set(products.map((p) => p.providerId)).size;

  return (
    <section className="px-5 py-6">
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
        {savePct > 0 && (
          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-500">
            최저가 {savePct}% 저렴
          </span>
        )}
      </div>
      <p className="mb-3 text-xs text-gray-500">
        다나와에 없는 상품이라 커뮤니티 {providerCount}곳의 핫딜을 모았어요
      </p>

      <ul className="flex flex-col gap-2">
        {products.map((p, i) => {
          const isLowest = p.parsedPrice != null && p.parsedPrice === min;
          return (
            <li key={p.id}>
              <a
                href={`/products/${p.id}`}
                className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-sm">{p.title}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                    {(p.mallName || p.provider?.nameKr) && (
                      <span className="text-gray-500">{p.mallName ?? p.provider?.nameKr}</span>
                    )}
                    {p.postedAt && <span>{new Date(p.postedAt).toLocaleDateString('ko-KR')}</span>}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  {isLowest && (
                    <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600">
                      최저가
                    </span>
                  )}
                  <span
                    className={`text-sm font-semibold ${isLowest ? 'text-rose-500' : 'text-gray-700'}`}
                  >
                    {won(p.parsedPrice, p.priceCurrency)}
                  </span>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
