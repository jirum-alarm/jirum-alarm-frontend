import { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';

import { checkDevice } from '@/app/actions/agent';

import { ProductService } from '@/shared/api/product';

import CommentContainerServer from '@/features/product-comment/ui/CommentContainerServer';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await ProductService.getProductInfo({ id: Number(id) }).catch(() => null);
  const title = product ? `${product.title} 댓글 | 지름알림` : '댓글 | 지름알림';
  // 상세의 부분 뷰(모바일 전용). 독립 색인 가치가 없어 noindex + canonical은 부모 상세로.
  return {
    title,
    robots: { index: false, follow: true },
    alternates: { canonical: `/products/${id}` },
  };
}

export default async function CommentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { isMobile } = await checkDevice();

  if (!isMobile) {
    redirect(`/products/${id}`, RedirectType.replace);
  }

  return <CommentContainerServer productId={+id} />;
}
