import { Metadata } from 'next';
import { notFound, redirect, RedirectType } from 'next/navigation';

import { checkDevice } from '@/shared/actions/agent';
import { ProductService } from '@/shared/api/product';

import { parseProductId } from '@/entities/product/lib/product-id';

import CommentContainerServer from '@/features/product-comment/ui/CommentContainerServer';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await ProductService.getProductInfo({ id: Number(id) }).catch(() => null);
  const title = product ? `${product.title} 댓글 | 지름알림` : '댓글 | 지름알림';
  // 상세의 부분 뷰(모바일 전용). 독립 색인 가치가 없어 noindex(링크는 따라감).
  // canonical 은 걸지 않는다 — noindex 와 남의 canonical 을 같이 내면 구글이 noindex 를 정본(상세)에 옮겨 읽을 여지가 있다(2026-10-22).
  return {
    title,
    robots: { index: false, follow: true },
  };
}

export default async function CommentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 상세·related 와 같은 가드. NaN 이 클라이언트로 흘러가면 조회가 조용히 깨진다.
  const productId = parseProductId(id);
  if (productId === null) {
    notFound();
  }

  const { isMobile } = await checkDevice();

  if (!isMobile) {
    redirect(`/products/${productId}`, RedirectType.replace);
  }

  return <CommentContainerServer productId={productId} />;
}
