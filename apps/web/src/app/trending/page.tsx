import BasicLayout from '@/components/layout/BasicLayout';
import { NAV_TYPE } from '@/components/layout/BottomNav';
import TopButton from '@/components/TopButton';
import TrendingPageHeader from './components/TrendingPageHeader';
import { Suspense } from 'react';
import { TrendingContainer } from './components/trending-container';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { CategoryQueries } from '@/entities/category';

const TrendingPage = async () => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(CategoryQueries.categoriesForUser());
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BasicLayout hasBottomNav navType={NAV_TYPE.TRENDING} header={<TrendingPageHeader />}>
        <div className="h-full px-4 pt-[56px]">
          <Suspense>
            <TrendingContainer />
          </Suspense>
        </div>
        <TopButton />
      </BasicLayout>
    </HydrationBoundary>
  );
};

export default TrendingPage;
