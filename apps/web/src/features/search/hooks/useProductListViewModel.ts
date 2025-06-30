import { useQuery } from '@apollo/client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { QueryProducts } from '@/graphql';
import { IProductOutput } from '@/graphql/interface/product';

const limit = 20;

export const useProductListViewModel = () => {
  const searchParams = useSearchParams();

  const [hasNextData, setHasNextData] = useState(true);
  const keywordParam = searchParams.get('keyword');

  const {
    data: { products } = {},
    fetchMore,
    loading,
  } = useQuery<IProductOutput>(QueryProducts, {
    variables: {
      limit,
      keyword: keywordParam || undefined,
    },
    skip: !keywordParam,
  });

  const { ref } = useInView({
    onChange(inView) {
      if (inView && products && hasNextData) {
        fetchMoreProducts();
      }
    },
  });

  const fetchMoreProducts = () => {
    const searchAfter = products?.at(-1)?.searchAfter;

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
    if (products && products.length % limit !== 0) {
      setHasNextData(false);
    }
  }, [products]);

  useEffect(() => {
    setHasNextData(true);
  }, [keywordParam]);

  return {
    loading,
    products,
    hasNextData,
    nextDataRef: ref,
    keyword: keywordParam,
  };
};
