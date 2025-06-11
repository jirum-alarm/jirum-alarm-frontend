import { Metadata } from 'next';
import { Suspense } from 'react';

import RecommendedProductTabsFetcher from '@/app/(home)/components/(home)/RecommendedProduct/RecommendedProductTabsFetcher';
import RecommendContainer from '@/app/recommend/components/RecommendContainer';
import RecommendPageHeader from '@/app/recommend/components/RecommendPageHeader';
import BasicLayout from '@/components/layout/BasicLayout';
import { ProductService } from '@/shared/api/product';

export async function generateMetadata({ searchParams }: any): Promise<Metadata> {
  const { productKeywords } = await ProductService.getProductKeywords();
  const recommend = searchParams?.recommend;
  const validRecommend = recommend && productKeywords?.includes(recommend);
  const selectedKeyword = validRecommend ? recommend : productKeywords?.[0] || '추천';
  const keywords =
    productKeywords?.slice(0, 10).join(', ') ||
    '추천, 인기, 상품, 쇼핑, 특가, 할인, 핫딜, 랭킹, 베스트, 지름알림';
  const title = `${selectedKeyword} 추천 상품 | 지름알림`;
  const description = `지름알림이 지금 추천하는 인기 상품! '${selectedKeyword}' 등 다양한 키워드를 만나보세요.`;
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `https://jirum-alarm.com/recommend?recommend=${encodeURIComponent(selectedKeyword)}`,
      images: ['/assets/images/opengraph-image.png'],
      type: 'website',
      siteName: '지름알림',
    },
  };
}

const RecommendPage = () => {
  return (
    <BasicLayout header={<RecommendPageHeader />}>
      <div className="px-[20px] pt-14">
        <Suspense>
          <RecommendedProductTabsFetcher>
            <RecommendContainer />
          </RecommendedProductTabsFetcher>
        </Suspense>
      </div>
    </BasicLayout>
  );
};

export default RecommendPage;
