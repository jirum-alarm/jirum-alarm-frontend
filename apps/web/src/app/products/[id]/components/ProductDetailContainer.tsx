import { IProduct, IProductGuide } from '@/graphql/interface';
import { cn } from '@/lib/cn';
import Image from 'next/image';
import { displayTime } from '@/util/displayTime';
import Button from '@/components/common/Button';
import { QueryProduct, QueryProducts, QueryProductsRanking } from '@/graphql';
import { getClient } from '@/lib/client';
import { getDayBefore } from '@/util/date';

export default async function ProductDetailContainer({ id }: { id: string }) {
  const { data } = await getClient().query<{ product: IProduct }>({
    query: QueryProduct,
    variables: {
      id: +id,
    },
  });
  console.warn('🚀 : ProductDetailContainer.tsx:11: data=', data.product.viewCount);

  return <ProductDetaiLayout product={data.product} />;
}

function ProductDetaiLayout({ product }: { product: IProduct }) {
  return (
    <main>
      <ProductImage product={product} />
      <div className="relative z-10 mt-[-32px] w-full rounded-t-3xl bg-white pt-8">
        <ProductInfoLayout>
          <ProductInfo product={product} />
          <HotdealGuide product={product} />
          <HotdealIndex product={product} />
          <CommunityReaction product={product} />
          {/* <RelatedProducts product={product} /> */}
          {/* <PopularProducts product={product} /> */}
        </ProductInfoLayout>
        <BottomCTA product={product} />
        <div className="h-24"></div>
      </div>
    </main>
  );
}

function ProductImage({ product }: { product: IProduct }) {
  return (
    <div>
      {product.thumbnail ? (
        <Image src={product.thumbnail} width={480} height={480} alt={product.title} />
      ) : (
        <div>no Image</div>
      )}
    </div>
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
        <span className="text-green-700">{product.viewCount}명</span>이 보고 있어요
      </div>

      <div className="inline-flex pt-3">
        <p>{product.price} </p>
        <div
          className={cn({
            'text-semibold flex h-[22px] items-center rounded-bl-lg rounded-tr-lg text-xs': true,
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

function HotdealGuide({ product }: { product: IProduct }) {
  console.log(product.guides);
  return (
    <section>
      <div className="bg-primary-100 px-4 py-3">
        <h2 className="text-primary-800">핫딜 정보 요약</h2>
      </div>

      <div className="flex flex-col gap-y-4 py-4">
        {product.guides?.map((guide) => <HotdealGuideItem key={guide.id} guide={guide} />)}
      </div>

      <div className=" bg-gray-50 px-3 pb-6 pt-4">
        <span className="text-gray-500">
          *AI요약은 실제와 다를 수 있습니다. 상품 구매시 행사 정보는 쇼핑몰 홈페이지에서 확인해
          주세요.
        </span>
      </div>

      <div className="pt-8">
        <hr />
      </div>
    </section>
  );
}

function HotdealGuideItem({ guide }: { guide: IProductGuide }) {
  return (
    <div className="flex gap-x-2 px-3">
      <div className="h-5 w-5 rounded-full bg-primary-100 p-[3px]">
        <HotdealGuideItemCheckIcon />
      </div>
      <div className="flex flex-col">
        <span className="leading-5 text-gray-900">{guide.title}</span>
        <span className="text-gray-600">{guide.content}</span>
      </div>
    </div>
  );
}

function HotdealGuideItemCheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M11 4.5L5.5 10L3 7.5"
        stroke="#7FC125"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HotdealIndex({ product }: { product: IProduct }) {
  const productPrice = product.prices?.[0].price || 0;
  const lowPrice = product.prices?.[2].price || 0;
  const lowestPrice = product.prices?.[3].price;

  const chiperPrice = lowPrice - productPrice;

  const lowerThen = (lowPrice: number, productPrice: number) => {
    const chiperPrice = lowPrice - productPrice;
    const cheaperPercent = (chiperPrice / productPrice) * 100;

    if (cheaperPercent < 10)  
     {product.isEnd ? '판매종료' : product.isHot ? '핫딜' : ''};
    }

if(chepierPercent >20) {
    return (
      <div className="text-semibold flex h-[22px] items-center rounded-bl-lg rounded-tr-lg text-xs">
        {product.isEnd ? '판매종료' : product.isHot ? '핫딜' : ''}

        if ()
  };

  return (
    <>
      <section>
        <h2 className="pb-3">핫딜 지수</h2>
        <div className="flex justify-between gap-x-16 border p-5 pr-8">
          <div>
            <div>
              <div
                className={cn({
                  'text-semibold flex h-[22px] items-center rounded-bl-lg rounded-tr-lg text-xs':
                    true,
                  'border border-gray-400 bg-white px-2 text-gray-500': product.isEnd,
                  'bg-error-500 px-3 text-white ': !product.isEnd && product.isHot,
                })}
              >
                {product.isEnd ? '판매종료' : product.isHot ? '핫딜' : ''}
              </div>
            </div>

            <div>
              다나와 처지가보다
              <br />
              <b>{chiperPrice}원</b> 저렴해요.
            </div>
          </div>
          <div className="flex">
            <div className="flex flex-col justify-between pr-2">
              <div>{lowPrice}원</div>
              <div>{productPrice}원</div>
              <div>{lowestPrice}원</div>
            </div>
            <div className="h-36 w-4 rounded-3xl bg-gray-200"></div>
          </div>
        </div>
      </section>
    </>
  );
}

function CommunityReaction({ product }: { product: IProduct }) {
  const community = {
    wantToBuy: 62,
    notSatisfied: 38,
  };

  return (
    <section>
      <h2 className="pb-3">커뮤니티 반응</h2>
      <div className="border p-5">
        <div className="flex justify-between">
          <span>구매하고 싶어요!</span>
          <span>조금 아쉬어요</span>
        </div>
        <div className="flex justify-between">
          <div>{community.wantToBuy}%</div>
          <div>{community.notSatisfied}%</div>
        </div>
        <div></div>
      </div>
    </section>
  );
}

function RelatedProducts({ product }: { product: IProduct }) {
  return (
    <section>
      <h2>다른 고객이 함께 본 상품</h2>
    </section>
  );
}

function PopularProducts({ product }: { product: IProduct }) {
  return (
    <section>
      <h2>‘{product.category}’에서 인기있는 상품</h2>
    </section>
  );
}

function BottomCTA({ product }: { product: IProduct }) {
  return (
    <div className="fixed bottom-0 flex w-full max-w-[480px] gap-x-2 bg-white px-5 pb-6 pt-4 shadow-2xl">
      <Button
        variant="outlined"
        className="flex w-[52px] flex-col items-center justify-center px-2 py-1"
      >
        <span className="text-[11px] leading-4 text-gray-900">찜하기</span>
      </Button>
      <Button>구매하러 가기</Button>
    </div>
  );
}
