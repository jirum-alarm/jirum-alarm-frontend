'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { ProductQueries } from '@/entities/product';

// Track B: 같은 상품인데 다나와에 없어 매칭 안 된 글들을, 여러 커뮤니티에서 모아 최저가 비교.
// 백엔드(clusteredProducts)가 FP 방어 2겹(가격 있는 글만 + 2개 이상 커뮤니티일 때만) 후 최저가순으로 줌.
// → 빈 배열이면 similarProducts(Meili 유사검색)로 폴백. 그것도 없으면 섹션 자체 숨김.
//
// ponytail: Track B(정확·좁음) 우선, 없을 때만 similarProducts(넓음·"비슷한 상품")로 폴백.
// 둘은 목적이 달라 제목·최저가강조를 구분한다(같은 상품 최저가 vs 비슷한 상품). 근거·설계 =
// jirum vault domain/user-retention-first-visit-modal.

type Props = {
  productId: number;
  title?: string;
};

function won(price: number | null, currency: string | null): string {
  if (price == null) return '-';
  if (currency === 'USD') return `$${Math.round(price).toLocaleString()}`;
  return `${Math.round(price).toLocaleString()}원`;
}

const VISIBLE_COUNT = 5;

export default function ClusteredPriceSection({ productId, title = '판매처별 최저가' }: Props) {
  // client 전용 조회 — SSR 에서 이 쿼리가 실행되면 서버 fetch 가 staging authentik 프록시로 가
  // 로그인 HTML 을 받아 'Unexpected token <' 로 SSR 이 깨진다. mounted 게이트로 SSR/하이드레이션
  // 중에는 쿼리를 막고(브라우저 마운트 후에만 enabled) 실행 → 로그인된 client 에서만 조회.
  // 하단 보조 블록이라 SSR/SEO 불필요.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: clusteredData, isLoading: clusteredLoading } = useQuery({
    ...ProductQueries.clusteredProducts({ id: productId }),
    enabled: mounted,
  });
  const clustered = clusteredData?.clusteredProducts ?? [];
  const hasClustered = clustered.length >= 2;

  // Track B 클러스터가 없을 때만 Meili 유사검색 폴백 조회(불필요 요청 방지).
  const { data: similarData } = useQuery({
    ...ProductQueries.similarProducts({ id: productId }),
    enabled: mounted && !clusteredLoading && !hasClustered,
  });
  const similar = similarData?.similarProducts ?? [];

  // Track B 우선. 없으면 similar 폴백.
  const isFallback = !hasClustered;
  const products = hasClustered ? clustered : similar;

  if (products.length < 2) return null;

  const prices = products.map((p) => p.parsedPrice).filter((v): v is number => v != null);
  const min = prices.length ? Math.min(...prices) : null;
  const max = prices.length ? Math.max(...prices) : null;
  const savePct = min != null && max != null && max > 0 ? Math.round(((max - min) / max) * 100) : 0;
  const sellerCount = new Set(products.map((p) => p.mallName ?? p.provider?.nameKr)).size;
  const visible = products.slice(0, VISIBLE_COUNT);
  const restCount = products.length - visible.length;

  // 폴백(비슷한 상품)은 "같은 상품 최저가"가 아니라 유사품 모음 → 제목 구분 + 최저가 강조 제거(오해 방지).
  const sectionTitle = isFallback ? '비슷한 상품' : title;
  const showLowestEmphasis = !isFallback;
  const subtitle = isFallback
    ? '이 상품과 비슷한 딜을 모아봤어요'
    : `같은 상품을 판매처 ${sellerCount}곳에서 모아 최저가순으로 보여드려요`;

  return (
    <section className="px-5 py-6">
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="text-base font-semibold">{sectionTitle}</h2>
        {showLowestEmphasis && savePct > 0 && (
          <span className="bg-error-50 text-error-500 rounded-full px-2 py-0.5 text-xs font-semibold">
            최저가 {savePct}% 저렴
          </span>
        )}
      </div>
      <p className="mb-3 text-xs text-gray-500">{subtitle}</p>

      <ul className="flex flex-col gap-2">
        {visible.map((p) => {
          const isLowest = showLowestEmphasis && p.parsedPrice != null && p.parsedPrice === min;
          return (
            <li key={p.id}>
              <a
                href={`/products/${p.id}`}
                data-track="product-card"
                data-source={isFallback ? 'similar_fallback' : 'clustered_price'}
                data-product-id={p.id}
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
                    <span className="bg-error-50 text-error-600 rounded px-1.5 py-0.5 text-[10px] font-semibold">
                      최저가
                    </span>
                  )}
                  <span
                    className={`text-sm font-semibold ${isLowest ? 'text-error-500' : 'text-gray-700'}`}
                  >
                    {won(p.parsedPrice, p.priceCurrency)}
                  </span>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
      {restCount > 0 && (
        <p className="mt-2 text-center text-xs text-gray-400">외 {restCount}개 더</p>
      )}
    </section>
  );
}
