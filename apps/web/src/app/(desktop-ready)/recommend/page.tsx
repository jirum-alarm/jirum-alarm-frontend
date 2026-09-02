import { Metadata } from 'next';
import { cache } from 'react';

import { checkDevice } from '@/app/actions/agent';

import { ProductService } from '@/shared/api/product';
import { METADATA_SERVICE_URL } from '@/shared/config/env';

import { RecommendPrefetch } from '@/widgets/recommend';
import RecommendContainer from '@/widgets/recommend/ui/RecommendContainer';

// generateMetadata 와 page 가 같은 키워드를 써야 <title> 과 <h1> 이 어긋나지 않는다.
// 요청 단위 memoize — GraphQL POST 는 Next fetch dedup 이 안 걸린다(상품 상세와 같은 패턴).
const getProductKeywordsCached = cache(() => ProductService.getProductKeywords());

/** URL 의 recommend 파라미터를 검증해 실제 표시할 키워드로 정규화. */
async function resolveSelectedKeyword(recommend?: string) {
  const { productKeywords } = await getProductKeywordsCached();
  const valid = recommend && productKeywords?.includes(recommend);
  return {
    productKeywords,
    selectedKeyword: valid ? recommend : productKeywords?.[0] || '추천',
  };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ recommend: string }>;
}): Promise<Metadata> {
  const recommend = (await searchParams)?.recommend;
  const { productKeywords, selectedKeyword } = await resolveSelectedKeyword(recommend);
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

const RecommendPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ recommend?: string }>;
}) => {
  const { isMobile } = await checkDevice();
  const { selectedKeyword } = await resolveSelectedKeyword((await searchParams)?.recommend);

  return (
    <RecommendPrefetch>
      {/* 본문이 키워드 칩부터 시작해 h1 이 없었다(2026-09-02 실측). title 과 같은 키워드를 쓴다. */}
      <h1 className="sr-only">{selectedKeyword} 추천 상품</h1>
      <RecommendContainer isMobile={isMobile} />
    </RecommendPrefetch>
  );
};

export default RecommendPage;
