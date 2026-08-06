import { detailPage } from '@/shared/lib/utils/navigation';
import BackButton from '@/shared/ui/layout/BackButton';
import PageHeader from '@/shared/ui/layout/PageHeader';

export default function CommentPageHeader({ productId }: { productId: number }) {
  return (
    <PageHeader leading={<BackButton backTo={detailPage(productId)} />} title="지름알림 댓글" />
  );
}
