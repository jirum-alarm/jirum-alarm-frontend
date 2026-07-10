import { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';

import { checkDevice } from '@/app/actions/agent';

import CommentContainerServer from '@/features/product-comment/ui/CommentContainerServer';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  // 상세의 부분 뷰(모바일 전용). canonical을 부모 상세로 지정해 중복 신호를 통합한다.
  return { alternates: { canonical: `/products/${id}` } };
}

export default async function CommentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { isMobile } = await checkDevice();

  if (!isMobile) {
    redirect(`/products/${id}`, RedirectType.replace);
  }

  return <CommentContainerServer productId={+id} />;
}
