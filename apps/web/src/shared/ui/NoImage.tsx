import { IllustEmpty } from '@/components/common/icons';
import { CATEGORY_MAP } from '@/constants/categories';

const ICON_SIZE = {
  product: 'size-[64px]',
  hotDeal: 'size-[52px]',
  'product-detail': 'size-[64px]',
};

export default function NoImage({
  type,
  categoryId,
}: {
  type: 'product' | 'hotDeal' | 'product-detail';
  categoryId?: number | null;
}) {
  const Icon = categoryId ? (CATEGORY_MAP[categoryId]?.iconComponent ?? IllustEmpty) : IllustEmpty;

  return (
    <div className="flex h-full items-center justify-center bg-gray-50">
      <Icon className={ICON_SIZE[type]} />
    </div>
  );
}
