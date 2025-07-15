import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { getAccessToken } from '@/app/actions/token';
import { ProductQuery } from '@/shared/api/gql/graphql';

import CommentSection from '../comment/CommentSection';
import CommunityReaction from '../CommunityReaction';
import HotdealGuide from '../HotdealGuide';
import HotdealScore from '../HotdealScore';
import { NoticeProfitLink } from '../NoticeProfitUrl';
import PopularProductsContainer from '../PopularProudctsContainer';
import ProductDetailImage from '../ProductDetailImage';
import ProductExpiredBanner from '../ProductExpiredBanner';
import ProductGuidesFetcher from '../ProductGuidesFetcher';
import RelatedProductsContainer from '../RelatedProductsContainer';

import BottomCTA from './BottomCTA';
import ProductInfo from './ProductInfo';
import { ViewerCount } from './ViewerCount';

type Product = NonNullable<ProductQuery['product']>;

async function ProductDetailLayout({
  productId,
  product,
}: {
  product: Product;
  productId: number;
}) {
  const token = await getAccessToken();

  const isUserLogin = !!token;

  return (
    <>
      {product.viewCount >= 10 && <ViewerCount count={product.viewCount} />}
      <main className="pt-[56px]">
        <div className="sticky top-0 -mb-6">
          <ProductDetailImage
            product={{
              title: product.title,
              thumbnail: product.thumbnail,
              categoryId: product.categoryId,
            }}
          />
        </div>
        <div className="relative z-10 w-full rounded-t-3xl border-t border-gray-100 bg-white pt-6">
          <div className="flex flex-col">
            <ProductInfo product={product} />
            <ErrorBoundary fallback={<Hr />}>
              <Suspense fallback={<Hr />}>
                <ProductExpiredBanner product={product} />
              </Suspense>
            </ErrorBoundary>
            <div className="mb-12 mt-4 flex flex-col gap-y-9 px-5">
              <ProductGuidesFetcher productId={productId}>
                <HotdealGuide productId={productId} />
              </ProductGuidesFetcher>
              <CommunityReaction product={product} />
              <HotdealScore product={product} />
            </div>
            <Hr />
            <CommentSection productId={productId} isUserLogin={isUserLogin} />
            <Hr />

            <div className="mb-8 mt-7 flex flex-col gap-y-8 px-5">
              {/* <ProductFeedback product={product} /> */}
              <RelatedProductsContainer product={product} />
              <PopularProductsContainer product={product} />
            </div>
            <NoticeProfitLink />
          </div>
          <div className="h-[64px] bg-gray-100" />
          <BottomCTA product={product} isUserLogin={isUserLogin} />
        </div>
      </main>
    </>
  );
}
export default ProductDetailLayout;

function Hr() {
  return <div className="h-[8px] bg-gray-100" />;
}
