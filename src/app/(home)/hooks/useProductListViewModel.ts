import { QueryProducts } from '@/graphql';
import { QueryCategories } from '@/graphql/category';
import { IProductOutput, OrderOptionType, ProductOrderType } from '@/graphql/interface/product';
import { ICategoryOutput } from '@/graphql/interface/category';
import { useDevice } from '@/hooks/useDevice';
import { useQuery, useSuspenseQuery } from '@apollo/client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { mp } from '@/lib/mixpanel';
import { EVENT } from '@/constants/mixpanel';

const limit = 20;
const allCategory = { id: '0', name: '전체' };

export const useProductListViewModel = () => {
  const searchParams = useSearchParams();
  const { isMobile, isJirumAlarmApp } = useDevice();

  const [hasNextData, setHasNextData] = useState(true);
  const categoryParam = searchParams.get('categoryId');
  const activeTab = categoryParam ? Number(categoryParam) + 1 : 0;
  const categoryId = categoryParam ? Number(categoryParam) : undefined;
  const isHotDeal = categoryId === 0;

  const { data: categoriesData } = useSuspenseQuery<ICategoryOutput>(QueryCategories);

  const {
    data: { products } = {},
    fetchMore,
    loading,
  } = useQuery<IProductOutput>(QueryProducts, {
    variables: {
      limit,
      categoryId,
      orderBy: ProductOrderType.ID,
      orderByOption: OrderOptionType.DESC,
      isApp: false,
      isReward: false,
      isGame: false,
    },
    skip: isHotDeal,
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

    mp.track(EVENT.CATEGORY_CHECK.NAME, {
      category: categoriesData.categories.find((category) => category.id === String(index)),
      page: EVENT.PAGE.HOME,
    });
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
  }, [categoryParam]);

  return {
    loading,
    activeTab,
    handleTabChange,
    isMobile: isMobile || isJirumAlarmApp,
    allCategory,
    products,
    categoriesData,
    hasNextData,
    ref,
  };
};
