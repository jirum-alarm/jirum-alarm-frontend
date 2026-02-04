import { redirect, RedirectType } from 'next/navigation';

import { checkDevice } from '@/app/actions/agent';

import CommentContainerServer from '@/features/product-comment/ui/CommentContainerServer';

export default async function CommentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { isMobile } = await checkDevice();

  if (!isMobile) {
    redirect(`/products/${id}`, RedirectType.replace);
  }

  return <CommentContainerServer productId={+id} />;
}
