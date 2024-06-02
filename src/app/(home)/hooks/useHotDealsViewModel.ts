import { useHotDeals, useHotDealsRandom } from '@/features/products';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

const LIMIT = 20;

export const useHotDealsViewModel = () => {
  const searchParams = useSearchParams();

  const [hasNextData, setHasNextData] = useState(true);
  const categoryParam = searchParams.get('categoryId');

  const { data: { products: hotDeals } = {}, fetchMore, loading } = useHotDeals({ limit: LIMIT });
  const { data: { products: hotDealsRandom } = {} } = useHotDealsRandom();

  const { ref } = useInView({
    onChange(inView) {
      if (inView && hotDeals && hasNextData) {
        fetchMoreHotDeals();
      }
    },
  });

  const fetchMoreHotDeals = () => {
    const searchAfter = hotDeals?.at(-1)?.searchAfter;
    fetchMore({
      variables: {
        searchAfter,
      },
      updateQuery: ({ products }, { fetchMoreResult }) => {
        if (fetchMoreResult.products.length < LIMIT) {
          setHasNextData(false);
        }
        return { products: [...products, ...fetchMoreResult.products] };
      },
    });
  };

  useEffect(() => {
    if (hotDeals && hotDeals.length % LIMIT !== 0) {
      setHasNextData(false);
    }
  }, [hotDeals]);

  useEffect(() => {
    setHasNextData(true);
  }, [categoryParam]);

  return {
    loading,
    hotDeals,
    hotDealsRandom,
    hasNextData,
    ref,
  };
};
