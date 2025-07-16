import { getAccessToken } from '@/app/actions/token';
import { cn } from '@/lib/cn';
import { ProductQuery } from '@/shared/api/gql/graphql';

import { CommentSection } from '../comment';
import CommunityReaction from '../CommunityReaction';
import HotdealGuide from '../HotdealGuide';
import HotdealScore from '../HotdealScore';
import PopularProductsContainer from '../PopularProudctsContainer';
import ProductDetailImage from '../ProductDetailImage';
import ProductGuidesFetcher from '../ProductGuidesFetcher';
import RelatedProductsContainer from '../RelatedProductsContainer';

import ProductInfo from './ProductInfo';

type Product = NonNullable<ProductQuery['product']>;

export default async function DesktopProductDetailLayout({
  product,
  productId,
}: {
  product: Product;
  productId: number;
}) {
  const token = await getAccessToken();

  const isUserLogin = !!token;

  return (
    <div className="mb-[68px] flex flex-col items-stretch">
      <div className="flex gap-x-6">
        <div className="flex-1 overflow-hidden rounded-[20px] border border-gray-200">
          <ProductDetailImage
            product={{
              title: product.title,
              thumbnail: product.thumbnail,
              categoryId: product.categoryId,
            }}
          />
        </div>
        <ProductInfo product={product} isUserLogin={isUserLogin} />
      </div>
      <Hr className="mb-[52px] mt-[60px]" />
      <div className="flex gap-x-6">
        <div className="flex-1 pr-2">
          <ProductGuidesFetcher productId={productId}>
            <HotdealGuide fixExpanded={true} productId={productId} />
          </ProductGuidesFetcher>
        </div>
        <div className="flex-1 pl-2">
          <CommunityReaction product={product} />
          <HotdealScore product={product} />
        </div>
      </div>
      <Hr className="mb-[60px] mt-[86px]" />
      <div className="flex flex-col gap-y-[60px]">
        <CommentSection productId={productId} isUserLogin={isUserLogin} />
        <Hr />

        <RelatedProductsContainer product={product} />
        <PopularProductsContainer product={product} />
      </div>
    </div>
  );
}

function Hr({ className }: { className?: string }) {
  return <div className={cn('h-[8px] bg-gray-100', className)} />;
}
