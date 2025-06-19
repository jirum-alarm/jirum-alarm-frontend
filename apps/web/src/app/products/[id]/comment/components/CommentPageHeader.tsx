import BackButton from '@/components/layout/BackButton';
import { detailPage } from '@/util/common';

export default function CommentPageHeader({ productId }: { productId: number }) {
  return (
    <header className="fixed top-0 z-50 flex h-[56px] w-full max-w-screen-mobile-max items-center justify-between border-b border-gray-100 bg-white px-5">
      <div className="flex items-center gap-x-2">
        <BackButton backTo={detailPage(productId)} />
        <span className="text-lg font-semibold text-gray-900">지름알림 댓글</span>
      </div>
    </header>
  );
}
