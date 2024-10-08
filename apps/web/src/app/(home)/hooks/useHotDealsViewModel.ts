import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { useHotDeals, useHotDealsRandom } from '@/features/products';

const LIMIT = 20;

export const useHotDealsViewModel = () => {
  const searchParams = useSearchParams();

  const [hasNextData, setHasNextData] = useState(true);
  const categoryParam = searchParams.get('categoryId');
  const categoryId = categoryParam ? Number(categoryParam) : undefined;
  const isHotDeal = categoryId === 0;

  const {
    data: { products: hotDeals } = {},
    fetchMore,
    loading,
  } = useHotDeals({ limit: LIMIT, skip: !isHotDeal });
  const { data: { communityRandomRankingProducts: hotDealsRandom } = {} } = useHotDealsRandom();

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
