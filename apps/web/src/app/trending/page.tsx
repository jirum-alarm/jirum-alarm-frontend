import BasicLayout from '@/components/layout/BasicLayout';
import { NAV_TYPE } from '@/components/layout/BottomNav';
import TopButton from '@/components/TopButton';
import TrendingPageHeader from './components/TrendingPageHeader';
import TrendingContainer from './components/TrendingContainer';
import { getMyCategories } from '@/features/users/server/categories';
import { getCategories } from '@/features/categories/components/categories';

const TrendingPage = async () => {
  const { categories } = await getTabCategories();

  return (
    <BasicLayout hasBottomNav navType={NAV_TYPE.TRENDING} header={<TrendingPageHeader />}>
      <div className="h-full px-4 pt-[56px]">
        <TrendingContainer categories={categories} />
      </div>
      <TopButton />
    </BasicLayout>
  );
};

export default TrendingPage;

const getTabCategories = async () => {
  // const { categories } = await getCategories();
  // [{id : null , name : '전체'}].categories
  // console.log('data : ', ca.data.categories);
  try {
    // const { data: categoriesData } = useSuspenseQuery<ICategoryOutput>(QueryCategories);
    const { data } = await getMyCategories();
    const favoriteCategories = data.me.favoriteCategories;
    if (favoriteCategories && favoriteCategories.length > 0) {
      return {
        categories: categories.filter((category) => {
          if (category.id === null) return true;
          return favoriteCategories.includes(category.id);
        }),
      };
    }
  } catch (e) {
    return { categories };
  }

  return { categories };
};

const categories = [
  { id: null, name: '전체' }, // api요청시 categoryId를 null로 보내야 핫딜 상품을 불러올 수 있어서 null로 설정
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
