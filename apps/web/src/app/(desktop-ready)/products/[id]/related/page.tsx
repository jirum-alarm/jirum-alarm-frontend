import { Suspense } from 'react';

import { checkDevice } from '@/app/actions/agent';
import { ProductService } from '@/shared/api/product';

import RelatedProductsView from './RelatedProductsView';

export default async function RelatedProductsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);

  const { isMobile } = await checkDevice();

  // Prefetch product to get title/keyword for client component
  // We can just pass the necessary data to the client component
  const product = await ProductService.getProductInfo({ id: productId });

  if (!product) {
    return (
      <div className="flex h-40 items-center justify-center">상품 정보를 찾을 수 없습니다.</div>
    );
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
