import { QueryProducts } from '@/graphql';
import { IProductOutput, OrderOptionType, ProductOrderType } from '@/graphql/interface/product';
import { useQuery } from '@apollo/client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

const limit = 20;

const now = new Date();
const kstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);
const twoDaysAgo = new Date(kstDate.getTime() - 2 * 24 * 60 * 60 * 1000);
const startDate = twoDaysAgo.toISOString();

export const useHotDealsViewModel = () => {
  const searchParams = useSearchParams();

  const [hasNextData, setHasNextData] = useState(true);
  const categoryParam = searchParams.get('categoryId');

  const {
    data: { products: hotDeals } = {},
    fetchMore,
    loading,
  } = useQuery<IProductOutput>(QueryProducts, {
    variables: {
      limit,
      categoryId: 0,
      startDate,
      orderBy: ProductOrderType.COMMUNITY_RANKING,
      orderByOption: OrderOptionType.DESC,
    },
  });

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
        if (fetchMoreResult.products.length < limit) {
          setHasNextData(false);
        }
        return { products: [...products, ...fetchMoreResult.products] };
      },
    });
  };

  useEffect(() => {
    if (hotDeals && hotDeals.length % limit !== 0) {
      setHasNextData(false);
    }
  }, [hotDeals]);

  useEffect(() => {
    setHasNextData(true);
  }, [categoryParam]);

  return {
    loading,
    hotDeals,
    hasNextData,
    ref,
  };
};
