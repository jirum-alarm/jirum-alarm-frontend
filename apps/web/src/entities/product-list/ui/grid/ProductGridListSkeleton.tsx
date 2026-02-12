import ProductImageCardSkeleton from '@/entities/product-list/ui/card/ProductImageCardSkeleton';

const ProductGridListSkeleton = ({ length = 12 }: { length?: number }) => {
  return (
    <div className="pc:grid-cols-5 pc:gap-x-[25px] pc:gap-y-10 grid animate-pulse grid-cols-2 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-3">
      {Array.from({ length }).map((_, i) => (
        <ProductImageCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default ProductGridListSkeleton;
