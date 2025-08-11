import { useSuspenseQuery } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';

import { ProductQueries } from '@entities/product';

const useRecommendedKeyword = () => {
  const {
    data: { productKeywords },
  } = useSuspenseQuery(ProductQueries.productKeywords());

  const [recommendedKeyword, setRecommendedKeyword] = useQueryState('recommend', {
    defaultValue: productKeywords[0],
    parse: (value) => {
      if (productKeywords.includes(value)) {
        return value;
      }
      return productKeywords[0];
    },
    shallow: false,
  });

  return { recommendedKeyword, setRecommendedKeyword, productKeywords };
};

export default useRecommendedKeyword;
