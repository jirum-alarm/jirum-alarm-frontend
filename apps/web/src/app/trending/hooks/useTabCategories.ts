// import { useGetMyCategories } from '@/features/categories/hooks/useCategories';

import { useGetMyCategories } from '@/features/users/useCategories';
import { StorageTokenKey } from '@/types/enum/auth';

const categories = [
  { id: null, name: '전체' },
  { id: 1, name: '컴퓨터' },
  { id: 2, name: '생활·식품' },
  { id: 3, name: '화장품' },
  { id: 4, name: '의류·잡화' },
  { id: 5, name: '도서' },
  { id: 6, name: '가전·가구' },
  { id: 7, name: '등산·레저' },
  { id: 8, name: '상품권' },
  { id: 9, name: '디지털' },
  { id: 10, name: '육아' },
  { id: 11, name: '기타' },
];

const useTabCategories = () => {
  const hasToken =
    typeof window === 'undefined' ? false : !!localStorage.getItem(StorageTokenKey.REFRESH_TOKEN);
  const { data } = useGetMyCategories({ suspenseSkip: !hasToken });
  const favoriteCategories = data?.me.favoriteCategories;
  if (favoriteCategories && favoriteCategories.length > 0) {
    return {
      categories: categories.filter((category) => {
        if (category.id === null) return true;
        return favoriteCategories.includes(category.id);
      }),
    };
  }

  return { categories };
};

export default useTabCategories;
