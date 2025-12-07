import { detailPage } from '@/shared/lib/utils/navigation';
import BackButton from '@/shared/ui/layout/BackButton';

export default function CommentPageHeader({ productId }: { productId: number }) {
  return (
    <header className="max-w-mobile-max fixed top-0 z-50 flex h-14 w-full items-center justify-between border-b border-gray-100 bg-white px-5">
      <div className="flex items-center gap-x-2">
        <BackButton backTo={detailPage(productId)} />
        <span className="text-lg font-semibold text-gray-900">지름알림 댓글</span>
      </div>
    </header>
  );
}
