import { QueryProducts } from '@/graphql';
import { QueryCategories } from '@/graphql/category';
import { IProductOutput } from '@/graphql/interface/product';
import { ICategory, ICategoryOutput } from '@/graphql/interface/category';
import { useDevice } from '@/hooks/useDevice';
import { useQuery, useSuspenseQuery } from '@apollo/client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { mp } from '@/lib/mixpanel';

const limit = 20;
const allCategory = { id: '0', name: '전체' };

export const useProductListViewModel = () => {
  const searchParams = useSearchParams();

  const [allCategories, setAllCategories] = useState<ICategory[]>([allCategory]);
  const [hasNextData, setHasNextData] = useState(true);
  const { isMobile } = useDevice();
  const tabIndexParam = searchParams.get('tab-index');
  const categoryParam = searchParams.get('category-id');
  const keywordParam = searchParams.get('keyword');
  const activeTab = +(tabIndexParam || 0);

  const { data: categoriesData } = useSuspenseQuery<ICategoryOutput>(QueryCategories);

  const { data: { products: initialProducts } = {} } = useQuery<IProductOutput>(QueryProducts, {
    variables: {
      limit,
      keyword: keywordParam || undefined,
    },
  });

  const {
    data: { products } = {},
    fetchMore,
    loading,
  } = useQuery<IProductOutput>(QueryProducts, {
    variables: {
      limit,
      keyword: keywordParam || undefined,
      categoryId: categoryParam === '0' ? undefined : Number(categoryParam),
    },
  });

  const { data: { products: hotDeals } = {} } = useQuery<IProductOutput>(QueryProducts, {
    variables: {
      limit: 10,
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

  const handleTabChange = (_index: number, _last?: number, event?: Event) => {
    const target = event?.target as HTMLElement;
    const tabIndex = target?.dataset['tabIndex'];
    const categoryId = target?.dataset['categoryId'];
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    tabIndex && current.set('tab-index', tabIndex);
    categoryId && current.set('category-id', categoryId);

    const search = current.toString();

    history.pushState({}, '', '?' + search);

    mp.track('Category Check', {
      category: categoriesData.categories.find((category) => category.id === categoryId),
      page: 'Search',
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
  }, [keywordParam, categoryParam]);

  useEffect(() => {
    const allExistCategories = [allCategory].concat(
      categoriesData.categories.filter((category) =>
        Array.from(
          new Set(initialProducts?.map((product) => product.categoryId?.toString())),
        ).includes(category.id),
      ),
    );
    setAllCategories(allExistCategories);
  }, [categoriesData.categories, initialProducts, keywordParam, products]);

  return {
    loading,
    activeTab,
    handleTabChange,
    isMobile,
    allCategory,
    initialProducts,
    products,
    hotDeals,
    categoriesData,
    allCategories,
    hasNextData,
    nextDataRef: ref,
    keyword: keywordParam,
  };
};
