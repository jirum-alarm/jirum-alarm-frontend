import ProductImageCardSkeleton from '../skeleton/ProductImageCardSkeleton';

const CarouselProductListSkeleton = () => {
  return (
    <div className="scrollbar-hide pc:gap-x-6 flex animate-pulse flex-nowrap justify-start gap-x-3 overflow-x-scroll px-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="pc:w-[192px] w-[120px] shrink-0">
          <ProductImageCardSkeleton />
        </div>
      ))}
    </div>
  );
};

export default CarouselProductListSkeleton;
