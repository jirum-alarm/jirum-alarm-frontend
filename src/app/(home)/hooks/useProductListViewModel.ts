import { QueryProducts } from '@/graphql';
import { QueryCategories } from '@/graphql/category';
import { IProductOutput } from '@/graphql/interface/product';
import { ICategoryOutput } from '@/graphql/interface/category';
import { useDevice } from '@/hooks/useDevice';
import { useQuery, useSuspenseQuery } from '@apollo/client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

const limit = 20;
const allCategory = { id: 0, name: '전체' };

export const useProductListViewModel = () => {
  const searchParams = useSearchParams();

  const [hasNextData, setHasNextData] = useState(true);
  const { isMobile } = useDevice();
  const categoryParam = searchParams.get('categoryId');
  const keywordParam = searchParams.get('keyword');
  const activeTab = categoryParam ? Number(categoryParam) + 1 : 0;

  const { data: categoriesData } = useSuspenseQuery<ICategoryOutput>(QueryCategories);

  const {
    data: { products } = {},
    fetchMore,
    loading,
  } = useQuery<IProductOutput>(QueryProducts, {
    variables: {
      limit,
      keyword: keywordParam || undefined,
      categoryId: categoryParam ? Number(categoryParam) : undefined,
    },
  });

  const { data: { products: hotDeals } = {} } = useQuery<IProductOutput>(QueryProducts, {
    variables: {
      limit: 5,
      categoryId: 0,
    },
  });

  const { ref } = useInView({
    onChange(inView) {
      if (inView && products && hasNextData) {
        fetchMoreProducts();
      }
    },
  });

  const handleTabChange = (index: number) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (index > 0) {
      current.set('categoryId', String(index - 1));
    } else {
      current.delete('categoryId');
    }
    const search = current.toString();
    history.pushState({}, '', '?' + search);
  };

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
  }, [keywordParam, categoryParam]);

  return {
    loading,
    activeTab,
    handleTabChange,
    isMobile,
    allCategory,
    products,
    hotDeals,
    categoriesData,
    hasNextData,
    ref,
  };
};
