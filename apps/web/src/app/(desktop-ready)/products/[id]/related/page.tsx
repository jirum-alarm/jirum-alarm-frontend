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

  // Prefetch product to get title/keyword for client component
  // We can just pass the necessary data to the client component
  const product = await getProductInfoCached(productId);

  // soft 404(200 + 안내문)는 서치어드바이저에서 "동일 title 다수"를 만든다. 상세 페이지와
  // 같은 정책으로 진짜 404 를 낸다.
  if (!product) {
    notFound();
  }

  const keyword =
    product.title
      .replace(/^\[.*?\]\s*/, '')
      .split('(')[0]
      .trim() || product.title;

  return (
    <Suspense fallback={<div className="flex h-40 items-center justify-center">로딩중...</div>}>
      <RelatedProductsView productId={productId} keyword={keyword} isMobile={isMobile} />
    </Suspense>
  );
}
