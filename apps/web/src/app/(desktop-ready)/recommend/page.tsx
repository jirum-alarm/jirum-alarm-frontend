import { Metadata } from 'next';

import RecommendContainer from '@/app/(desktop-ready)/recommend/components/RecommendContainer';
import { checkDevice } from '@/app/actions/agent';
import { METADATA_SERVICE_URL } from '@/constants/env';

import { ProductService } from '@shared/api/product';

import { RecommendPrefetch } from '@widgets/recommend';

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
  const url = `${METADATA_SERVICE_URL}/recommend?recommend=${encodeURIComponent(selectedKeyword)}`;
  const image = `${METADATA_SERVICE_URL}/opengraph-image.webp`;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url,
      images: [image],
      type: 'website',
      siteName: '지름알림',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image,
    },
    alternates: {
      canonical: url,
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
