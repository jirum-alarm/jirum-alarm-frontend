import { IllustEmpty } from '@/components/common/icons';

const ProductImageCardSkeleton = () => {
  return (
    <div className="w-full">
      <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100">
        <IllustEmpty />
      </div>
      <div className="flex flex-col">
        <div className="flex h-12 flex-col items-stretch justify-stretch gap-1 pt-2">
          <div className="grow rounded-sm bg-gray-100"></div>
          <div className="w-1/2 grow rounded-sm bg-gray-100"></div>
        </div>
        <div className="flex h-9 items-center pt-1">
          <div className="h-6 w-2/3 max-w-[120px] rounded-sm bg-gray-100 pc:max-w-[192px]" />
        </div>
      </div>
    </div>
  );
};

export default ProductImageCardSkeleton;
