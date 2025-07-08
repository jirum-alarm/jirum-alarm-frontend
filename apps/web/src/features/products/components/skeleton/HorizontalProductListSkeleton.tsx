import ProductImageCardSkeleton from './ProductImageCardSkeleton';

const HorizontalProductListSkeleton = () => {
  return (
    <div className="flex animate-pulse flex-nowrap justify-start gap-x-3 overflow-x-scroll scrollbar-hide pc:gap-x-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="w-[120px] shrink-0 pc:w-[192px]">
          <ProductImageCardSkeleton />
        </div>
      ))}
    </div>
  );
};

export default HorizontalProductListSkeleton;
