import { Metadata } from 'next';

import { checkDevice } from '@/app/actions/agent';

import { ProductService } from '@/shared/api/product';

import { RecommendPrefetch } from '@/widgets/recommend';
import RecommendContainer from '@/widgets/recommend/ui/RecommendContainer';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ recommend: string }>;
}): Promise<Metadata> {
  const { productKeywords } = await ProductService.getProductKeywords();
  const recommend = (await searchParams)?.recommend;
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
      images: ['/assets/images/opengraph-image.webp'],
      type: 'website',
      siteName: '지름알림',
    },
  };
}

const RecommendPage = async () => {
  const { isMobile } = await checkDevice();

  return (
    <RecommendPrefetch>
      <RecommendContainer isMobile={isMobile} />
    </RecommendPrefetch>
  );
};

export default RecommendPage;
