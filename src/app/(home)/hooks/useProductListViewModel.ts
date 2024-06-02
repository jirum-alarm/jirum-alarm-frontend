import { QueryProducts } from '@/graphql';
import { IProductOutput, OrderOptionType, ProductOrderType } from '@/graphql/interface/product';
import { useDevice } from '@/hooks/useDevice';
import { useQuery } from '@apollo/client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { mp } from '@/lib/mixpanel';
import { EVENT } from '@/constants/mixpanel';

const limit = 20;
const allCategory = { id: '0', name: '전체' };

const categoriesData = {
  categories: [
    { id: '0', name: 'HOT🔥' },
    { id: '1', name: '컴퓨터' },
    { id: '2', name: '생활/식품' },
    { id: '3', name: '화장품' },
    { id: '4', name: '의류/잡화' },
    { id: '5', name: '도서' },
    { id: '6', name: '가전/가구' },
    { id: '7', name: '등산/레저' },
    { id: '8', name: '상품권' },
    { id: '9', name: '디지털' },
    { id: '10', name: '육아' },
    { id: '11', name: '기타' },
  ],
};

export const useProductListViewModel = () => {
  const searchParams = useSearchParams();
  const { isMobile, isJirumAlarmApp } = useDevice();

  const [hasNextData, setHasNextData] = useState(true);
  const categoryParam = searchParams.get('categoryId');
  const activeTab = categoryParam ? Number(categoryParam) + 1 : 0;
  const categoryId = categoryParam ? Number(categoryParam) : undefined;
  const isHotDeal = categoryId === 0;

  /*
   * use local storage to cache
   * */
  // const { data: categoriesData } = useSuspenseQuery<ICategoryOutput>(QueryCategories);

  const {
    data: { products } = {},
    fetchMore,
    loading,
  } = useQuery<IProductOutput>(QueryProducts, {
    variables: {
      limit,
      categoryId,
      orderBy: ProductOrderType.POSTED_AT,
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
