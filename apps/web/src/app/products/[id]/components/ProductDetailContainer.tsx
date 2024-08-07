import { IProduct, IProductGuide } from '@/graphql/interface';
import { cn } from '@/lib/cn';
import { displayTime } from '@/util/displayTime';
import { getProductDetail } from '@/features/products/server/productDetail';
import RelatedProducts from './RelatedProducts';
import PopularProducts from './PopularProudcts';
import BottomCTA from './BottomCTA';
import CommunityReaction from './CommunityReaction';
import ProductImage from './ProductImage';
import HotdealGuide from './HotdealGuide';
import { getProductGuides } from '@/features/products/server/productGuides';
import { getAccessToken } from '@/app/actions/token';

export default async function ProductDetailContainer({ id }: { id: string }) {
  const productId = +id;

  const { data } = await getProductDetail(productId);
  const { data: productGuides } = await getProductGuides(productId);

  const token = await getAccessToken();

  return (
    <ProductDetaiLayout
      product={data.product}
      productGuides={productGuides.productGuides}
      isUserLogin={!!token}
    />
  );
}

function ProductDetaiLayout({
  product,
  productGuides,
  isUserLogin,
}: {
  product: IProduct;
  productGuides: IProductGuide[];
  isUserLogin: boolean;
}) {
  return (
    <>
      <main className="border-x border-t border-gray-100 pb-7">
        <ProductImage product={product} />
        <div className="relative z-10 mt-[-32px] w-full rounded-t-3xl bg-white pt-8">
          <ProductInfoLayout>
            <ProductInfo product={product} />
            <HotdealGuide productGuides={productGuides} />
            <HotdealIndex product={product} />
            <CommunityReaction product={product} />
            <RelatedProducts product={product} />
            <PopularProducts product={product} />
          </ProductInfoLayout>
          <BottomCTA product={product} isUserLogin={isUserLogin} />
        </div>
      </main>
      <div className="h-22"></div>
    </>
  );
}

function ProductInfoLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-y-10 px-5">{children}</div>;
}

function ProductInfo({ product }: { product: IProduct }) {
  return (
    <section>
      <h1 className="text-gray-700">{product.title}</h1>

      <div>
        <span className="text-green-700">{product?.viewCount}명</span>이 보고 있어요
      </div>

      <div className="inline-flex gap-x-2 pt-3">
        {product.price && <p>{product.price}</p>}
        <div
          className={cn({
            'text-semibold flex h-[22px] items-center rounded-lg text-xs leading-[20px]': true,
            'border border-gray-400 bg-white px-2 text-gray-500': product.isEnd,
            'bg-error-500 px-3 text-white ': !product.isEnd && product.isHot,
          })}
        >
          {product.isEnd ? '판매종료' : product.isHot ? '핫딜' : ''}
        </div>
      </div>

      <div className="flex items-center gap-x-3 pt-1">
        <div className="inline-flex items-center gap-x-1">
          <DisplayTimeIcon />
          <span className="text-sm text-gray-500">{displayTime(product.postedAt)}</span>
        </div>
        <div className="h-2 border border-gray-400"></div>
        <span className="text-sm text-gray-400">{product.mallName}</span>
      </div>
    </section>
  );
}

function DisplayTimeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8.00014 13.1429C9.21256 13.1429 10.3753 12.6612 11.2326 11.8039C12.0899 10.9466 12.5716 9.78385 12.5716 8.57143C12.5716 7.35901 12.0899 6.19625 11.2326 5.33894C10.3753 4.48163 9.21256 4 8.00014 4C6.78772 4 5.62496 4.48163 4.76765 5.33894C3.91034 6.19625 3.42871 7.35901 3.42871 8.57143C3.42871 9.78385 3.91034 10.9466 4.76765 11.8039C5.62496 12.6612 6.78772 13.1429 8.00014 13.1429Z"
        fill="#98A2B3"
        stroke="#98A2B3"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.99993 2.85742L2.28564 4.57171M13.7142 4.57171L11.9999 2.85742M4.57136 12.0003L3.4285 13.1431M11.4285 12.0003L12.5714 13.1431M7.99993 6.28599V8.57171L9.14279 9.71457"
        stroke="#98A2B3"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 6.28516V8.57087L9.14286 9.71373"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HotdealIndex({ product }: { product: IProduct }) {
  const prices = product?.prices;

  if (!prices?.length) {
    return;
  }

  const productPrice = prices?.[0].price || 0;
  const lowPrice = prices?.[2].price || 0;
  const lowestPrice = prices?.[3].price;

  const chiperPrice = lowPrice - productPrice;

  const lowerThen = (
    lowPrice: number,
    productPrice: number,
  ): '비쌈' | '중박' | '대박' | '초대박' => {
    const chiperPrice = lowPrice - productPrice;
    const cheaperPercent = (chiperPrice / productPrice) * 100;

    if (cheaperPercent < 0) {
      return '비쌈';
    }

    if (cheaperPercent <= 10) {
      return '중박';
    }

    if (cheaperPercent < 20) {
      return '대박';
    }

    if (cheaperPercent >= 20) {
      return '초대박';
    }

    return '비쌈';
  };

  /**
   * 최저가보다 비싸면 일단 숨김
   * @TODO 비쌀때 표시 고려
   * */
  if (chiperPrice < 0) {
    return undefined;
  }

  return (
    <>
      <hr />
      <section>
        <h2 className="pb-3">핫딜 지수</h2>
        <div className="flex justify-between gap-x-16 rounded border p-5 pr-8">
          <div>
            <div className="pt-3">
              <HotdealChip type={lowerThen(lowPrice, productPrice)} />
              <div className="h-3"></div>
              <p className="text-nowrap txs:text-xs xs:text-sm">
                다나와 처죄가보다
                <br />
                <b>{chiperPrice}원</b> 저렴해요.
              </p>
            </div>
          </div>
          <div className="flex">
            <div className="flex flex-col items-end justify-between pr-2 text-xs text-gray-600">
              <span>{lowPrice}원</span>
              <div className="relative mr-3 rounded-full bg-gray-900 px-2.5 py-1.5 font-semibold text-primary-500">
                <p className="text-nowrap txs:text-xs xs:text-sm">{productPrice}원</p>
                <div className="absolute -right-1 top-1/2 -translate-y-1/2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="6"
                    height="8"
                    viewBox="0 0 6 8"
                    fill="none"
                  >
                    <path d="M6 4L-3.26266e-07 7.4641L-2.34249e-08 0.535898L6 4Z" fill="#101828" />
                  </svg>
                </div>
              </div>
              <span>{lowestPrice}원</span>
            </div>
            <div className="flex h-36 w-4 rounded-3xl bg-gray-200">
              <div className="flex h-full w-full flex-col items-center justify-between py-1">
                <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-4 border-gray-900 bg-primary-500 pt-0.5">
                  <Won />
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function HotdealChip({ type }: { type: '비쌈' | '중박' | '대박' | '초대박' }) {
  return (
    <span
      className={cn(
        'rounded-lg px-3 py-1 text-xs font-semibold',

        {
          hidden: type === '비쌈',
          'bg-gray-100 text-gray-500': type === '중박',
          'bg-primary-100 text-primary-800': type === '대박',
          'bg-error-100 text-error-600': type === '초대박',
        },
      )}
    >
      {type}
    </span>
  );
}

function Won() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="11" viewBox="0 0 18 11" fill="none">
      <path
        d="M2.19971 1L5.57471 10L8.94971 1L12.3247 10L15.6997 1"
        stroke="#101828"
        strokeWidth="1.5"
        strokeLinecap="square"
        strokeLinejoin="bevel"
      />
      <path
        d="M1.2998 4.59961H3.0998"
        stroke="#101828"
        strokeWidth="1.5"
        strokeLinecap="square"
        strokeLinejoin="bevel"
      />
      <path
        d="M14.7998 4.59961H16.5998"
        stroke="#101828"
        strokeWidth="1.5"
        strokeLinecap="square"
        strokeLinejoin="bevel"
      />
    </svg>
  );
}
