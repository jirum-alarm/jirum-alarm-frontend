import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { checkDevice } from '@/app/actions/agent';

import { parseProductId } from '@/entities/product/lib/product-id';

import { getProductInfoCached } from './getProductInfoCached';
import RelatedProductsView from './RelatedProductsView';

export default async function RelatedProductsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // 숫자가 아닌 id 는 조회에서 던져 500 이 나갔다(`/products/null/related` 실측). 404 로.
  const productId = parseProductId(id);
  if (productId === null) {
    notFound();
  }

  const { isMobile } = await checkDevice();

  // 없는 상품이면 404 — 목록은 클라이언트가 상품 id 로 받는다.
  const product = await getProductInfoCached(productId);

  // soft 404(200 + 안내문)는 서치어드바이저에서 "동일 title 다수"를 만든다. 상세 페이지와
  // 같은 정책으로 진짜 404 를 낸다.
  if (!product) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="flex h-40 items-center justify-center">로딩중...</div>}>
      <RelatedProductsView productId={productId} isMobile={isMobile} />
    </Suspense>
  );
}
