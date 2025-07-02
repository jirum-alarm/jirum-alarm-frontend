import { IllustStandingSmall } from '@/components/common/icons';

const ProductImageCardSkeleton = () => {
  return (
    <div className="w-full">
      <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100">
        <IllustStandingSmall />
      </div>
      <div className="flex flex-col">
        <div className="flex h-12 flex-col items-stretch justify-stretch gap-1 pt-2">
          <div className="grow rounded bg-gray-100"></div>
          <div className="w-1/2 grow rounded bg-gray-100"></div>
        </div>
        <div className="flex h-9 items-center pt-1">
          <div className="h-6 w-16 max-w-[120px] rounded bg-gray-100 pc:w-[192px]" />
        </div>
      </div>
    </div>
  );
};

export default ProductImageCardSkeleton;
