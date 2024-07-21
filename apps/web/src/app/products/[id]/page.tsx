import BasicLayout from '@/components/layout/BasicLayout';
import { IProduct } from '@/graphql/interface';
import { cn } from '@/lib/cn';
import Image from 'next/image';
import { displayTime } from '@/util/displayTime';
import Button from '@/components/common/Button';

const PRODUCT = {
  id: '4148546',
  title: '신라면 20봉 외(11,240원/무료)',
  mallId: 1,
  url: 'https://www.ppomppu.co.kr/zboard/view.php?id=ppomppu&page=1&divpage=89&no=561272',
  isHot: true,
  isEnd: false,
  ship: '',
  price: '11,240원',
  providerId: 1,
  categoryId: 11,
  category: '식품/건강',
  thumbnail: 'https://file.jirum-alarm.com/ppomppu/561272.jpg',
  provider: {
    nameKr: '뽐뿌',
    __typename: 'Provider',
  },
  searchAfter: ['1721402143000'],
  postedAt: '2024-07-19T15:15:43.000Z',
  __typename: 'ProductOutput',
} as unknown as IProduct;

export default function ProductDetail() {
  return (
    <BasicLayout hasBackButton>
      <ProductDetaiLayout product={PRODUCT} />
    </BasicLayout>
  );
}

function ProductDetaiLayout({ product }: { product: IProduct }) {
  return (
    <div>
      <ProductImage product={product} />
      <ProductInfoLayout>
        <ProductInfo product={product} />
        <HotdealIndex product={product} />
        <CommunityReaction product={product} />
        <RelatedProducts product={product} />
        <PopularProducts product={product} />
      </ProductInfoLayout>
      <BottomCTA product={product} />
      <div className="h-24"></div>
    </div>
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
      <h1>{product.title}</h1>
      <div className="inline-flex">
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

      <div>
        <span className="text-sm text-gray-500">{displayTime(product.postedAt)}</span>
        {' | '}
        <span className="text-sm text-gray-400">{product.provider.nameKr}</span>
      </div>
      <div className="pb-10 pt-8">
        <hr />
      </div>
      <HotdealManual product={product} />
    </section>
  );
}

function HotdealManual({ product }: { product: IProduct }) {
  return (
    <section>
      <h2>핫딜 구매 방법</h2>
      <div className="border px-3 pb-6 pt-4">
        <span>안내</span>
        <br />
        <span>상품 구매시 적용되는 정확한 행사 가격 등은 쇼핑몰 홈페이지에서 확인해 주세요.</span>
      </div>
    </section>
  );
}

function HotdealIndex({ product }: { product: IProduct }) {
  const danawa = {
    chiperThan: 4000,
    topPrice: 32000,
    lowestPrice: 27000,
  };

  return (
    <>
      <section>
        <h2>핫딜 지수</h2>
        <div className="flex justify-between gap-x-16 border p-5 pr-8">
          <div>
            <span>대박</span>
            <div>
              다나와 처지가보다
              <br />
              <b>{danawa.chiperThan}원</b> 저렴해요.
            </div>
          </div>
          <div className="flex">
            <div className="flex flex-col justify-between pr-2">
              <div>{danawa.topPrice}원</div>
              <div>{product.price}</div>
              <div>{danawa.lowestPrice}원</div>
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
      <h2>커뮤니티 반응</h2>
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
