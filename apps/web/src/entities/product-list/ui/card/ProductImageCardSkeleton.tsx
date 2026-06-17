import { IllustEmpty } from '@/shared/ui/common/icons';

const ProductImageCardSkeleton = () => {
  return (
    <div className="w-full">
      <div className="bg-surface-muted flex aspect-square items-center justify-center rounded-lg" />
      <div className="flex flex-col">
        <div className="flex h-12 flex-col items-stretch justify-stretch gap-1 pt-2">
          <div className="bg-surface-muted grow rounded-sm"></div>
          <div className="bg-surface-muted w-1/2 grow rounded-sm"></div>
        </div>
        <div className="flex h-8 items-center pt-1">
          <div className="pc:max-w-[192px] bg-surface-muted h-6 w-2/3 max-w-[120px] rounded-sm" />
        </div>
      </div>
    </div>
  );
};

export default ProductImageCardSkeleton;
