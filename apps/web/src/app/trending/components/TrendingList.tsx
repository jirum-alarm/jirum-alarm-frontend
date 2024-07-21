import ProductTrendingImageCard from '@/features/products/components/ProductTrendingImageCard';
import useTrendingViewModel from '../hooks/useTrendingViewModel';
import { LoadingSpinner } from '@/components/common/icons';

interface TrendingListProps {
  categoryId: number;
  isActive: boolean;
}

const TrendingList = ({ categoryId, isActive }: TrendingListProps) => {
  const { products, loadingCallbackRef, isPending } = useTrendingViewModel({
    categoryId,
    isActive,
  });
  return (
    <div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-2">
        {products?.map((product) => (
          <ProductTrendingImageCard key={product.id} product={product} />
        ))}
      </div>
      <div className="flex w-full items-center justify-center pb-6 pt-3" ref={loadingCallbackRef}>
        {isPending && <LoadingSpinner />}
      </div>
    </div>
  );
};

export default TrendingList;
