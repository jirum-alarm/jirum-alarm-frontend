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
        <span className="text-green-700">{product?.viewCount}명</span>이 보고 있어요
      </div>

      <div className="inline-flex gap-x-2 pt-3">
        <p>{product.price} </p>
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

function HotdealGuide({ product }: { product: IProduct }) {
  return (
    <section>
      <div className="rounded-t bg-primary-100 px-4 py-3">
        <h2 className="text-primary-800">핫딜 정보 요약</h2>
      </div>

      <div className="flex flex-col gap-y-4 py-4">
        {product.guides?.map((guide) => <HotdealGuideItem key={guide.id} guide={guide} />)}
      </div>

      <div className="rounded-b bg-gray-50 px-3 py-2">
        <span className="text-gray-500">
          *요약은 실제와 다를 수 있습니다.
          <br />
          상품 구매시 행사 정보는 쇼핑몰 홈페이지에서 확인해 주세요.
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
  const prices = product?.prices;
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
      <section>
        <h2 className="pb-3">핫딜 지수</h2>
        <div className="flex justify-between gap-x-16 rounded border p-5 pr-8">
          <div>
            <div className="pt-3">
              <HotdeealChip type={lowerThen(lowPrice, productPrice)} />
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

function HotdeealChip({ type }: { type: '비쌈' | '중박' | '대박' | '초대박' }) {
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
        stroke-width="1.5"
        stroke-linecap="square"
        stroke-linejoin="bevel"
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

function CommunityReaction({ product }: { product: IProduct }) {
  return (
    <section>
      <h2 className="pb-3">커뮤니티 반응</h2>
      <div className="rounded border p-5">
        <div className="flex justify-between">
          <div className="inline-flex items-center gap-x-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <rect width="20" height="20" fill="white" />
              <path
                d="M15.8506 14.6287C15.7284 15.1254 15.5431 15.6221 15.279 16.0952C14.3999 17.6761 12.8978 18.5158 10.8202 18.5947C7.68605 18.7129 5.60843 18.1531 4.45727 16.8797C3.51899 15.835 3.20755 14.3093 3.50322 12.212C3.52688 12.0385 3.55447 11.869 3.57813 11.7074C3.58207 11.6719 3.58995 11.6364 3.5939 11.6009C4.08669 9.13697 4.55977 8.64024 4.55977 8.64024C4.55977 8.64024 6.08546 12.1213 6.79902 9.83083C6.96854 9.28678 7.06316 8.77822 7.12624 8.29331C7.13018 8.27754 7.13018 8.25783 7.13412 8.23812C7.36672 7.41023 7.44162 6.66907 7.51258 5.94762C7.52835 5.79781 7.54412 5.65194 7.55989 5.50608V5.49425C7.55989 5.49425 7.56778 5.47454 7.57172 5.46271C7.74518 4.92261 8.02115 4.37068 8.47057 3.77539C8.47057 3.77539 8.84904 6.38128 9.94895 7.12638C11.0449 7.87543 12.953 8.26966 13.3827 10.2172C13.8124 12.1686 14.3368 10.6114 14.3368 10.6114C14.3368 10.6114 14.5733 11.3013 15.3854 12.3066C15.6456 12.6338 15.8743 13.5445 15.8506 14.6287Z"
                fill="#9EF22E"
              />
              <path
                d="M10.4691 11.1745C10.665 11.1745 10.8239 11.0156 10.8239 10.8197C10.8239 10.6237 10.665 10.4648 10.4691 10.4648C10.2731 10.4648 10.1143 10.6237 10.1143 10.8197C10.1143 11.0156 10.2731 11.1745 10.4691 11.1745Z"
                fill="black"
              />
              <path
                d="M8.90022 11.1745C9.09618 11.1745 9.25503 11.0156 9.25503 10.8197C9.25503 10.6237 9.09618 10.4648 8.90022 10.4648C8.70426 10.4648 8.54541 10.6237 8.54541 10.8197C8.54541 11.0156 8.70426 11.1745 8.90022 11.1745Z"
                fill="black"
              />
              <path
                d="M9.29447 12.9962C8.56908 12.9962 8.12753 12.46 7.98167 12.117C7.91859 11.9672 7.98561 11.7938 8.13542 11.7307C8.28523 11.6676 8.45869 11.7346 8.52177 11.8844C8.55331 11.9593 8.86081 12.5901 9.62168 12.3536C9.77938 12.3023 9.94495 12.393 9.99226 12.5468C10.0396 12.7044 9.95284 12.87 9.79909 12.9173C9.61774 12.9725 9.44822 13.0001 9.29053 13.0001L9.29447 12.9962Z"
                fill="black"
              />
              <mask
                id="path-5-outside-1_1192_12483"
                maskUnits="userSpaceOnUse"
                x="2"
                y="0.5"
                width="15"
                height="19"
                fill="black"
              >
                <rect fill="white" x="2" y="0.5" width="15" height="19" />
                <path d="M16.1148 10.9025C16.0202 10.7369 15.9256 10.5674 15.8349 10.4018C15.4249 9.6567 15.1647 9.19545 14.944 9.04564L14.7311 8.89977L14.6483 9.14814C14.5734 9.37286 14.4275 9.61728 14.3644 9.63699C14.3644 9.63305 14.1989 9.56603 14.0215 8.75391C13.6627 7.11784 12.3972 6.47523 11.2815 5.91148C10.9307 5.73013 10.5956 5.56061 10.3156 5.37138C9.24333 4.6381 8.84515 1.99279 8.84121 1.9652L8.77025 1.5L8.4864 1.87846C7.3786 3.34502 7.25245 4.5908 7.12235 5.90754C7.04745 6.66841 6.9686 7.45294 6.69658 8.32814C6.5586 8.75785 6.38908 9.00227 6.21561 9.0141H6.19984C5.7583 9.0141 5.05656 7.87082 4.69781 7.05082L4.56377 6.73937L4.35877 7.01139C4.33512 7.04687 3.72011 7.9063 3.11299 12.1561C2.7976 14.3757 3.14059 16.0078 4.1656 17.1432C5.03291 18.1051 6.37331 18.6886 8.23015 18.9054C8.54948 18.9449 8.88064 18.9725 9.2315 18.9843C9.45622 18.9961 9.68487 19.004 9.92141 19.004H10.0279C10.2881 19.004 10.5561 19.0001 10.8321 18.9882C10.8676 18.9882 10.9031 18.9843 10.9346 18.9803C13.0792 18.8739 14.6995 17.9435 15.626 16.2877C16.7614 14.2495 16.5445 11.6634 16.1148 10.9025ZM15.8507 14.628C15.7285 15.1247 15.5432 15.6215 15.2791 16.0945C14.8375 16.887 14.2422 17.4901 13.4971 17.908C13.4064 17.9593 13.3118 18.0105 13.2133 18.0539C12.9334 18.1879 12.6298 18.2983 12.3105 18.3811C12.2001 18.4126 12.0858 18.4363 11.9714 18.46C11.861 18.4836 11.7428 18.5033 11.6284 18.5191C11.5062 18.5388 11.384 18.5546 11.2579 18.5625C11.1357 18.5743 11.0095 18.5822 10.8833 18.59C10.8636 18.594 10.84 18.594 10.8203 18.594C10.5088 18.6058 10.2092 18.6098 9.92141 18.6098C9.68487 18.6098 9.45228 18.6019 9.2315 18.59C9.04227 18.5822 8.85698 18.5703 8.67958 18.5546C8.54159 18.5427 8.40756 18.5309 8.27746 18.5151C8.16707 18.5033 8.06063 18.4875 7.95419 18.4718C7.85957 18.46 7.76495 18.4442 7.67428 18.4284C7.45745 18.389 7.24851 18.3456 7.05139 18.2983C6.96072 18.2747 6.87004 18.251 6.77937 18.2234C6.72023 18.2076 6.66504 18.1919 6.60985 18.1761C6.49946 18.1406 6.39302 18.1051 6.29052 18.0657C6.10128 17.9948 5.92388 17.9199 5.7583 17.841C5.69917 17.8095 5.64003 17.7819 5.58484 17.7503C5.26945 17.5808 4.98954 17.3837 4.74512 17.1629C4.69781 17.1235 4.65445 17.0841 4.61502 17.0407C4.55983 16.9895 4.50858 16.9343 4.45733 16.8791C3.51905 15.8344 3.20761 14.3087 3.50328 12.2113C3.52694 12.0379 3.55453 11.8684 3.57819 11.7067C3.58213 11.6712 3.59001 11.6358 3.59396 11.6003C3.96059 9.22699 4.3154 8.08765 4.51646 7.58697C4.84368 8.24535 5.51782 9.40834 6.20379 9.40834C6.21561 9.40834 6.22744 9.40834 6.23927 9.40834C6.59802 9.38862 6.87793 9.06535 7.0711 8.45035C7.09476 8.37938 7.11447 8.30842 7.13418 8.2414C7.36678 7.41351 7.44168 6.67235 7.51264 5.9509C7.52841 5.80109 7.54418 5.65523 7.55995 5.50936V5.49753C7.67428 4.48435 7.83986 3.55396 8.53371 2.49741C8.71112 3.33713 9.16843 5.06782 10.0949 5.70254C10.3945 5.90359 10.7375 6.081 11.1041 6.26629C12.1922 6.81822 13.3158 7.38986 13.6351 8.84064C13.8125 9.64882 14.0293 10.0155 14.3408 10.0312C14.6049 10.0549 14.7784 9.79863 14.8967 9.57786C15.0622 9.81834 15.2869 10.2244 15.488 10.595C15.5826 10.7606 15.6772 10.9301 15.7718 11.0996C16.032 11.5648 16.241 13.0787 15.8507 14.6319V14.628Z" />
              </mask>
              <path
                d="M16.1148 10.9025C16.0202 10.7369 15.9256 10.5674 15.8349 10.4018C15.4249 9.6567 15.1647 9.19545 14.944 9.04564L14.7311 8.89977L14.6483 9.14814C14.5734 9.37286 14.4275 9.61728 14.3644 9.63699C14.3644 9.63305 14.1989 9.56603 14.0215 8.75391C13.6627 7.11784 12.3972 6.47523 11.2815 5.91148C10.9307 5.73013 10.5956 5.56061 10.3156 5.37138C9.24333 4.6381 8.84515 1.99279 8.84121 1.9652L8.77025 1.5L8.4864 1.87846C7.3786 3.34502 7.25245 4.5908 7.12235 5.90754C7.04745 6.66841 6.9686 7.45294 6.69658 8.32814C6.5586 8.75785 6.38908 9.00227 6.21561 9.0141H6.19984C5.7583 9.0141 5.05656 7.87082 4.69781 7.05082L4.56377 6.73937L4.35877 7.01139C4.33512 7.04687 3.72011 7.9063 3.11299 12.1561C2.7976 14.3757 3.14059 16.0078 4.1656 17.1432C5.03291 18.1051 6.37331 18.6886 8.23015 18.9054C8.54948 18.9449 8.88064 18.9725 9.2315 18.9843C9.45622 18.9961 9.68487 19.004 9.92141 19.004H10.0279C10.2881 19.004 10.5561 19.0001 10.8321 18.9882C10.8676 18.9882 10.9031 18.9843 10.9346 18.9803C13.0792 18.8739 14.6995 17.9435 15.626 16.2877C16.7614 14.2495 16.5445 11.6634 16.1148 10.9025ZM15.8507 14.628C15.7285 15.1247 15.5432 15.6215 15.2791 16.0945C14.8375 16.887 14.2422 17.4901 13.4971 17.908C13.4064 17.9593 13.3118 18.0105 13.2133 18.0539C12.9334 18.1879 12.6298 18.2983 12.3105 18.3811C12.2001 18.4126 12.0858 18.4363 11.9714 18.46C11.861 18.4836 11.7428 18.5033 11.6284 18.5191C11.5062 18.5388 11.384 18.5546 11.2579 18.5625C11.1357 18.5743 11.0095 18.5822 10.8833 18.59C10.8636 18.594 10.84 18.594 10.8203 18.594C10.5088 18.6058 10.2092 18.6098 9.92141 18.6098C9.68487 18.6098 9.45228 18.6019 9.2315 18.59C9.04227 18.5822 8.85698 18.5703 8.67958 18.5546C8.54159 18.5427 8.40756 18.5309 8.27746 18.5151C8.16707 18.5033 8.06063 18.4875 7.95419 18.4718C7.85957 18.46 7.76495 18.4442 7.67428 18.4284C7.45745 18.389 7.24851 18.3456 7.05139 18.2983C6.96072 18.2747 6.87004 18.251 6.77937 18.2234C6.72023 18.2076 6.66504 18.1919 6.60985 18.1761C6.49946 18.1406 6.39302 18.1051 6.29052 18.0657C6.10128 17.9948 5.92388 17.9199 5.7583 17.841C5.69917 17.8095 5.64003 17.7819 5.58484 17.7503C5.26945 17.5808 4.98954 17.3837 4.74512 17.1629C4.69781 17.1235 4.65445 17.0841 4.61502 17.0407C4.55983 16.9895 4.50858 16.9343 4.45733 16.8791C3.51905 15.8344 3.20761 14.3087 3.50328 12.2113C3.52694 12.0379 3.55453 11.8684 3.57819 11.7067C3.58213 11.6712 3.59001 11.6358 3.59396 11.6003C3.96059 9.22699 4.3154 8.08765 4.51646 7.58697C4.84368 8.24535 5.51782 9.40834 6.20379 9.40834C6.21561 9.40834 6.22744 9.40834 6.23927 9.40834C6.59802 9.38862 6.87793 9.06535 7.0711 8.45035C7.09476 8.37938 7.11447 8.30842 7.13418 8.2414C7.36678 7.41351 7.44168 6.67235 7.51264 5.9509C7.52841 5.80109 7.54418 5.65523 7.55995 5.50936V5.49753C7.67428 4.48435 7.83986 3.55396 8.53371 2.49741C8.71112 3.33713 9.16843 5.06782 10.0949 5.70254C10.3945 5.90359 10.7375 6.081 11.1041 6.26629C12.1922 6.81822 13.3158 7.38986 13.6351 8.84064C13.8125 9.64882 14.0293 10.0155 14.3408 10.0312C14.6049 10.0549 14.7784 9.79863 14.8967 9.57786C15.0622 9.81834 15.2869 10.2244 15.488 10.595C15.5826 10.7606 15.6772 10.9301 15.7718 11.0996C16.032 11.5648 16.241 13.0787 15.8507 14.6319V14.628Z"
                fill="black"
              />
              <path
                d="M16.1148 10.9025C16.0202 10.7369 15.9256 10.5674 15.8349 10.4018C15.4249 9.6567 15.1647 9.19545 14.944 9.04564L14.7311 8.89977L14.6483 9.14814C14.5734 9.37286 14.4275 9.61728 14.3644 9.63699C14.3644 9.63305 14.1989 9.56603 14.0215 8.75391C13.6627 7.11784 12.3972 6.47523 11.2815 5.91148C10.9307 5.73013 10.5956 5.56061 10.3156 5.37138C9.24333 4.6381 8.84515 1.99279 8.84121 1.9652L8.77025 1.5L8.4864 1.87846C7.3786 3.34502 7.25245 4.5908 7.12235 5.90754C7.04745 6.66841 6.9686 7.45294 6.69658 8.32814C6.5586 8.75785 6.38908 9.00227 6.21561 9.0141H6.19984C5.7583 9.0141 5.05656 7.87082 4.69781 7.05082L4.56377 6.73937L4.35877 7.01139C4.33512 7.04687 3.72011 7.9063 3.11299 12.1561C2.7976 14.3757 3.14059 16.0078 4.1656 17.1432C5.03291 18.1051 6.37331 18.6886 8.23015 18.9054C8.54948 18.9449 8.88064 18.9725 9.2315 18.9843C9.45622 18.9961 9.68487 19.004 9.92141 19.004H10.0279C10.2881 19.004 10.5561 19.0001 10.8321 18.9882C10.8676 18.9882 10.9031 18.9843 10.9346 18.9803C13.0792 18.8739 14.6995 17.9435 15.626 16.2877C16.7614 14.2495 16.5445 11.6634 16.1148 10.9025ZM15.8507 14.628C15.7285 15.1247 15.5432 15.6215 15.2791 16.0945C14.8375 16.887 14.2422 17.4901 13.4971 17.908C13.4064 17.9593 13.3118 18.0105 13.2133 18.0539C12.9334 18.1879 12.6298 18.2983 12.3105 18.3811C12.2001 18.4126 12.0858 18.4363 11.9714 18.46C11.861 18.4836 11.7428 18.5033 11.6284 18.5191C11.5062 18.5388 11.384 18.5546 11.2579 18.5625C11.1357 18.5743 11.0095 18.5822 10.8833 18.59C10.8636 18.594 10.84 18.594 10.8203 18.594C10.5088 18.6058 10.2092 18.6098 9.92141 18.6098C9.68487 18.6098 9.45228 18.6019 9.2315 18.59C9.04227 18.5822 8.85698 18.5703 8.67958 18.5546C8.54159 18.5427 8.40756 18.5309 8.27746 18.5151C8.16707 18.5033 8.06063 18.4875 7.95419 18.4718C7.85957 18.46 7.76495 18.4442 7.67428 18.4284C7.45745 18.389 7.24851 18.3456 7.05139 18.2983C6.96072 18.2747 6.87004 18.251 6.77937 18.2234C6.72023 18.2076 6.66504 18.1919 6.60985 18.1761C6.49946 18.1406 6.39302 18.1051 6.29052 18.0657C6.10128 17.9948 5.92388 17.9199 5.7583 17.841C5.69917 17.8095 5.64003 17.7819 5.58484 17.7503C5.26945 17.5808 4.98954 17.3837 4.74512 17.1629C4.69781 17.1235 4.65445 17.0841 4.61502 17.0407C4.55983 16.9895 4.50858 16.9343 4.45733 16.8791C3.51905 15.8344 3.20761 14.3087 3.50328 12.2113C3.52694 12.0379 3.55453 11.8684 3.57819 11.7067C3.58213 11.6712 3.59001 11.6358 3.59396 11.6003C3.96059 9.22699 4.3154 8.08765 4.51646 7.58697C4.84368 8.24535 5.51782 9.40834 6.20379 9.40834C6.21561 9.40834 6.22744 9.40834 6.23927 9.40834C6.59802 9.38862 6.87793 9.06535 7.0711 8.45035C7.09476 8.37938 7.11447 8.30842 7.13418 8.2414C7.36678 7.41351 7.44168 6.67235 7.51264 5.9509C7.52841 5.80109 7.54418 5.65523 7.55995 5.50936V5.49753C7.67428 4.48435 7.83986 3.55396 8.53371 2.49741C8.71112 3.33713 9.16843 5.06782 10.0949 5.70254C10.3945 5.90359 10.7375 6.081 11.1041 6.26629C12.1922 6.81822 13.3158 7.38986 13.6351 8.84064C13.8125 9.64882 14.0293 10.0155 14.3408 10.0312C14.6049 10.0549 14.7784 9.79863 14.8967 9.57786C15.0622 9.81834 15.2869 10.2244 15.488 10.595C15.5826 10.7606 15.6772 10.9301 15.7718 11.0996C16.032 11.5648 16.241 13.0787 15.8507 14.6319V14.628Z"
                stroke="black"
                strokeWidth="0.2"
                mask="url(#path-5-outside-1_1192_12483)"
              />
            </svg>
            <span className="font-semibold text-gray-900">구매하고 싶어요!</span>
          </div>

          <div className="inline-flex items-center gap-x-1">
            <span className="text-gray-600">조금 아쉬어요</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <rect width="20" height="20" fill="white" />
              <path
                d="M15.8506 14.6287C15.7284 15.1254 15.5431 15.6221 15.279 16.0952C14.3999 17.6761 12.8978 18.5158 10.8202 18.5947C7.68605 18.7129 5.60843 18.1531 4.45727 16.8797C3.51899 15.835 3.20755 14.3093 3.50322 12.212C3.52688 12.0385 3.55447 11.869 3.57813 11.7074C3.58207 11.6719 3.58995 11.6364 3.5939 11.6009C4.08669 9.13697 4.55977 8.64024 4.55977 8.64024C4.55977 8.64024 6.08546 12.1213 6.79902 9.83083C6.96854 9.28678 7.06316 8.77822 7.12624 8.29331C7.13018 8.27754 7.13018 8.25783 7.13412 8.23812C7.36672 7.41023 7.44162 6.66907 7.51258 5.94762C7.52835 5.79781 7.54412 5.65194 7.55989 5.50608V5.49425C7.55989 5.49425 7.56778 5.47454 7.57172 5.46271C7.74518 4.92261 8.02115 4.37068 8.47057 3.77539C8.47057 3.77539 8.84904 6.38128 9.94895 7.12638C11.0449 7.87543 12.953 8.26966 13.3827 10.2172C13.8124 12.1686 14.3368 10.6114 14.3368 10.6114C14.3368 10.6114 14.5733 11.3013 15.3854 12.3066C15.6456 12.6338 15.8743 13.5445 15.8506 14.6287Z"
                fill="#D0D5DD"
              />
              <path
                d="M10.4691 11.1745C10.665 11.1745 10.8239 11.0156 10.8239 10.8197C10.8239 10.6237 10.665 10.4648 10.4691 10.4648C10.2731 10.4648 10.1143 10.6237 10.1143 10.8197C10.1143 11.0156 10.2731 11.1745 10.4691 11.1745Z"
                fill="#667085"
              />
              <path
                d="M8.90022 11.1745C9.09618 11.1745 9.25503 11.0156 9.25503 10.8197C9.25503 10.6237 9.09618 10.4648 8.90022 10.4648C8.70426 10.4648 8.54541 10.6237 8.54541 10.8197C8.54541 11.0156 8.70426 11.1745 8.90022 11.1745Z"
                fill="#667085"
              />
              <path
                d="M9.56893 11.81C10.1473 11.3722 10.823 11.5332 11.1463 11.7186C11.287 11.8 11.3382 11.9788 11.2569 12.1195C11.1755 12.2602 10.9967 12.3114 10.856 12.2301C10.7857 12.1894 10.1598 11.8721 9.69589 12.5199C9.60109 12.6559 9.41435 12.6836 9.28383 12.5895C9.15093 12.4924 9.12015 12.308 9.21418 12.1775C9.32546 12.024 9.44397 11.8997 9.5697 11.8045L9.56893 11.81Z"
                fill="#667085"
              />
              <mask
                id="path-5-outside-1_1192_12494"
                maskUnits="userSpaceOnUse"
                x="2"
                y="0.5"
                width="15"
                height="19"
                fill="black"
              >
                <rect fill="white" x="2" y="0.5" width="15" height="19" />
                <path d="M16.1148 10.9025C16.0202 10.7369 15.9256 10.5674 15.8349 10.4018C15.4249 9.6567 15.1647 9.19545 14.944 9.04564L14.7311 8.89977L14.6483 9.14814C14.5734 9.37286 14.4275 9.61728 14.3644 9.63699C14.3644 9.63305 14.1989 9.56603 14.0215 8.75391C13.6627 7.11784 12.3972 6.47523 11.2815 5.91148C10.9307 5.73013 10.5956 5.56061 10.3156 5.37138C9.24333 4.6381 8.84515 1.99279 8.84121 1.9652L8.77025 1.5L8.4864 1.87846C7.3786 3.34502 7.25245 4.5908 7.12235 5.90754C7.04745 6.66841 6.9686 7.45294 6.69658 8.32814C6.5586 8.75785 6.38908 9.00227 6.21561 9.0141H6.19984C5.7583 9.0141 5.05656 7.87082 4.69781 7.05082L4.56377 6.73937L4.35877 7.01139C4.33512 7.04687 3.72011 7.9063 3.11299 12.1561C2.7976 14.3757 3.14059 16.0078 4.1656 17.1432C5.03291 18.1051 6.37331 18.6886 8.23015 18.9054C8.54948 18.9449 8.88064 18.9725 9.2315 18.9843C9.45622 18.9961 9.68487 19.004 9.92141 19.004H10.0279C10.2881 19.004 10.5561 19.0001 10.8321 18.9882C10.8676 18.9882 10.9031 18.9843 10.9346 18.9803C13.0792 18.8739 14.6995 17.9435 15.626 16.2877C16.7614 14.2495 16.5445 11.6634 16.1148 10.9025ZM15.8507 14.628C15.7285 15.1247 15.5432 15.6215 15.2791 16.0945C14.8375 16.887 14.2422 17.4901 13.4971 17.908C13.4064 17.9593 13.3118 18.0105 13.2133 18.0539C12.9334 18.1879 12.6298 18.2983 12.3105 18.3811C12.2001 18.4126 12.0858 18.4363 11.9714 18.46C11.861 18.4836 11.7428 18.5033 11.6284 18.5191C11.5062 18.5388 11.384 18.5546 11.2579 18.5625C11.1357 18.5743 11.0095 18.5822 10.8833 18.59C10.8636 18.594 10.84 18.594 10.8203 18.594C10.5088 18.6058 10.2092 18.6098 9.92141 18.6098C9.68487 18.6098 9.45228 18.6019 9.2315 18.59C9.04227 18.5822 8.85698 18.5703 8.67958 18.5546C8.54159 18.5427 8.40756 18.5309 8.27746 18.5151C8.16707 18.5033 8.06063 18.4875 7.95419 18.4718C7.85957 18.46 7.76495 18.4442 7.67428 18.4284C7.45745 18.389 7.24851 18.3456 7.05139 18.2983C6.96072 18.2747 6.87004 18.251 6.77937 18.2234C6.72023 18.2076 6.66504 18.1919 6.60985 18.1761C6.49946 18.1406 6.39302 18.1051 6.29052 18.0657C6.10128 17.9948 5.92388 17.9199 5.7583 17.841C5.69917 17.8095 5.64003 17.7819 5.58484 17.7503C5.26945 17.5808 4.98954 17.3837 4.74512 17.1629C4.69781 17.1235 4.65445 17.0841 4.61502 17.0407C4.55983 16.9895 4.50858 16.9343 4.45733 16.8791C3.51905 15.8344 3.20761 14.3087 3.50328 12.2113C3.52694 12.0379 3.55453 11.8684 3.57819 11.7067C3.58213 11.6712 3.59001 11.6358 3.59396 11.6003C3.96059 9.22699 4.3154 8.08765 4.51646 7.58697C4.84368 8.24535 5.51782 9.40834 6.20379 9.40834C6.21561 9.40834 6.22744 9.40834 6.23927 9.40834C6.59802 9.38862 6.87793 9.06535 7.0711 8.45035C7.09476 8.37938 7.11447 8.30842 7.13418 8.2414C7.36678 7.41351 7.44168 6.67235 7.51264 5.9509C7.52841 5.80109 7.54418 5.65523 7.55995 5.50936V5.49753C7.67428 4.48435 7.83986 3.55396 8.53371 2.49741C8.71112 3.33713 9.16843 5.06782 10.0949 5.70254C10.3945 5.90359 10.7375 6.081 11.1041 6.26629C12.1922 6.81822 13.3158 7.38986 13.6351 8.84064C13.8125 9.64882 14.0293 10.0155 14.3408 10.0312C14.6049 10.0549 14.7784 9.79863 14.8967 9.57786C15.0622 9.81834 15.2869 10.2244 15.488 10.595C15.5826 10.7606 15.6772 10.9301 15.7718 11.0996C16.032 11.5648 16.241 13.0787 15.8507 14.6319V14.628Z" />
              </mask>
              <path
                d="M16.1148 10.9025C16.0202 10.7369 15.9256 10.5674 15.8349 10.4018C15.4249 9.6567 15.1647 9.19545 14.944 9.04564L14.7311 8.89977L14.6483 9.14814C14.5734 9.37286 14.4275 9.61728 14.3644 9.63699C14.3644 9.63305 14.1989 9.56603 14.0215 8.75391C13.6627 7.11784 12.3972 6.47523 11.2815 5.91148C10.9307 5.73013 10.5956 5.56061 10.3156 5.37138C9.24333 4.6381 8.84515 1.99279 8.84121 1.9652L8.77025 1.5L8.4864 1.87846C7.3786 3.34502 7.25245 4.5908 7.12235 5.90754C7.04745 6.66841 6.9686 7.45294 6.69658 8.32814C6.5586 8.75785 6.38908 9.00227 6.21561 9.0141H6.19984C5.7583 9.0141 5.05656 7.87082 4.69781 7.05082L4.56377 6.73937L4.35877 7.01139C4.33512 7.04687 3.72011 7.9063 3.11299 12.1561C2.7976 14.3757 3.14059 16.0078 4.1656 17.1432C5.03291 18.1051 6.37331 18.6886 8.23015 18.9054C8.54948 18.9449 8.88064 18.9725 9.2315 18.9843C9.45622 18.9961 9.68487 19.004 9.92141 19.004H10.0279C10.2881 19.004 10.5561 19.0001 10.8321 18.9882C10.8676 18.9882 10.9031 18.9843 10.9346 18.9803C13.0792 18.8739 14.6995 17.9435 15.626 16.2877C16.7614 14.2495 16.5445 11.6634 16.1148 10.9025ZM15.8507 14.628C15.7285 15.1247 15.5432 15.6215 15.2791 16.0945C14.8375 16.887 14.2422 17.4901 13.4971 17.908C13.4064 17.9593 13.3118 18.0105 13.2133 18.0539C12.9334 18.1879 12.6298 18.2983 12.3105 18.3811C12.2001 18.4126 12.0858 18.4363 11.9714 18.46C11.861 18.4836 11.7428 18.5033 11.6284 18.5191C11.5062 18.5388 11.384 18.5546 11.2579 18.5625C11.1357 18.5743 11.0095 18.5822 10.8833 18.59C10.8636 18.594 10.84 18.594 10.8203 18.594C10.5088 18.6058 10.2092 18.6098 9.92141 18.6098C9.68487 18.6098 9.45228 18.6019 9.2315 18.59C9.04227 18.5822 8.85698 18.5703 8.67958 18.5546C8.54159 18.5427 8.40756 18.5309 8.27746 18.5151C8.16707 18.5033 8.06063 18.4875 7.95419 18.4718C7.85957 18.46 7.76495 18.4442 7.67428 18.4284C7.45745 18.389 7.24851 18.3456 7.05139 18.2983C6.96072 18.2747 6.87004 18.251 6.77937 18.2234C6.72023 18.2076 6.66504 18.1919 6.60985 18.1761C6.49946 18.1406 6.39302 18.1051 6.29052 18.0657C6.10128 17.9948 5.92388 17.9199 5.7583 17.841C5.69917 17.8095 5.64003 17.7819 5.58484 17.7503C5.26945 17.5808 4.98954 17.3837 4.74512 17.1629C4.69781 17.1235 4.65445 17.0841 4.61502 17.0407C4.55983 16.9895 4.50858 16.9343 4.45733 16.8791C3.51905 15.8344 3.20761 14.3087 3.50328 12.2113C3.52694 12.0379 3.55453 11.8684 3.57819 11.7067C3.58213 11.6712 3.59001 11.6358 3.59396 11.6003C3.96059 9.22699 4.3154 8.08765 4.51646 7.58697C4.84368 8.24535 5.51782 9.40834 6.20379 9.40834C6.21561 9.40834 6.22744 9.40834 6.23927 9.40834C6.59802 9.38862 6.87793 9.06535 7.0711 8.45035C7.09476 8.37938 7.11447 8.30842 7.13418 8.2414C7.36678 7.41351 7.44168 6.67235 7.51264 5.9509C7.52841 5.80109 7.54418 5.65523 7.55995 5.50936V5.49753C7.67428 4.48435 7.83986 3.55396 8.53371 2.49741C8.71112 3.33713 9.16843 5.06782 10.0949 5.70254C10.3945 5.90359 10.7375 6.081 11.1041 6.26629C12.1922 6.81822 13.3158 7.38986 13.6351 8.84064C13.8125 9.64882 14.0293 10.0155 14.3408 10.0312C14.6049 10.0549 14.7784 9.79863 14.8967 9.57786C15.0622 9.81834 15.2869 10.2244 15.488 10.595C15.5826 10.7606 15.6772 10.9301 15.7718 11.0996C16.032 11.5648 16.241 13.0787 15.8507 14.6319V14.628Z"
                fill="#667085"
              />
              <path
                d="M16.1148 10.9025C16.0202 10.7369 15.9256 10.5674 15.8349 10.4018C15.4249 9.6567 15.1647 9.19545 14.944 9.04564L14.7311 8.89977L14.6483 9.14814C14.5734 9.37286 14.4275 9.61728 14.3644 9.63699C14.3644 9.63305 14.1989 9.56603 14.0215 8.75391C13.6627 7.11784 12.3972 6.47523 11.2815 5.91148C10.9307 5.73013 10.5956 5.56061 10.3156 5.37138C9.24333 4.6381 8.84515 1.99279 8.84121 1.9652L8.77025 1.5L8.4864 1.87846C7.3786 3.34502 7.25245 4.5908 7.12235 5.90754C7.04745 6.66841 6.9686 7.45294 6.69658 8.32814C6.5586 8.75785 6.38908 9.00227 6.21561 9.0141H6.19984C5.7583 9.0141 5.05656 7.87082 4.69781 7.05082L4.56377 6.73937L4.35877 7.01139C4.33512 7.04687 3.72011 7.9063 3.11299 12.1561C2.7976 14.3757 3.14059 16.0078 4.1656 17.1432C5.03291 18.1051 6.37331 18.6886 8.23015 18.9054C8.54948 18.9449 8.88064 18.9725 9.2315 18.9843C9.45622 18.9961 9.68487 19.004 9.92141 19.004H10.0279C10.2881 19.004 10.5561 19.0001 10.8321 18.9882C10.8676 18.9882 10.9031 18.9843 10.9346 18.9803C13.0792 18.8739 14.6995 17.9435 15.626 16.2877C16.7614 14.2495 16.5445 11.6634 16.1148 10.9025ZM15.8507 14.628C15.7285 15.1247 15.5432 15.6215 15.2791 16.0945C14.8375 16.887 14.2422 17.4901 13.4971 17.908C13.4064 17.9593 13.3118 18.0105 13.2133 18.0539C12.9334 18.1879 12.6298 18.2983 12.3105 18.3811C12.2001 18.4126 12.0858 18.4363 11.9714 18.46C11.861 18.4836 11.7428 18.5033 11.6284 18.5191C11.5062 18.5388 11.384 18.5546 11.2579 18.5625C11.1357 18.5743 11.0095 18.5822 10.8833 18.59C10.8636 18.594 10.84 18.594 10.8203 18.594C10.5088 18.6058 10.2092 18.6098 9.92141 18.6098C9.68487 18.6098 9.45228 18.6019 9.2315 18.59C9.04227 18.5822 8.85698 18.5703 8.67958 18.5546C8.54159 18.5427 8.40756 18.5309 8.27746 18.5151C8.16707 18.5033 8.06063 18.4875 7.95419 18.4718C7.85957 18.46 7.76495 18.4442 7.67428 18.4284C7.45745 18.389 7.24851 18.3456 7.05139 18.2983C6.96072 18.2747 6.87004 18.251 6.77937 18.2234C6.72023 18.2076 6.66504 18.1919 6.60985 18.1761C6.49946 18.1406 6.39302 18.1051 6.29052 18.0657C6.10128 17.9948 5.92388 17.9199 5.7583 17.841C5.69917 17.8095 5.64003 17.7819 5.58484 17.7503C5.26945 17.5808 4.98954 17.3837 4.74512 17.1629C4.69781 17.1235 4.65445 17.0841 4.61502 17.0407C4.55983 16.9895 4.50858 16.9343 4.45733 16.8791C3.51905 15.8344 3.20761 14.3087 3.50328 12.2113C3.52694 12.0379 3.55453 11.8684 3.57819 11.7067C3.58213 11.6712 3.59001 11.6358 3.59396 11.6003C3.96059 9.22699 4.3154 8.08765 4.51646 7.58697C4.84368 8.24535 5.51782 9.40834 6.20379 9.40834C6.21561 9.40834 6.22744 9.40834 6.23927 9.40834C6.59802 9.38862 6.87793 9.06535 7.0711 8.45035C7.09476 8.37938 7.11447 8.30842 7.13418 8.2414C7.36678 7.41351 7.44168 6.67235 7.51264 5.9509C7.52841 5.80109 7.54418 5.65523 7.55995 5.50936V5.49753C7.67428 4.48435 7.83986 3.55396 8.53371 2.49741C8.71112 3.33713 9.16843 5.06782 10.0949 5.70254C10.3945 5.90359 10.7375 6.081 11.1041 6.26629C12.1922 6.81822 13.3158 7.38986 13.6351 8.84064C13.8125 9.64882 14.0293 10.0155 14.3408 10.0312C14.6049 10.0549 14.7784 9.79863 14.8967 9.57786C15.0622 9.81834 15.2869 10.2244 15.488 10.595C15.5826 10.7606 15.6772 10.9301 15.7718 11.0996C16.032 11.5648 16.241 13.0787 15.8507 14.6319V14.628Z"
                stroke="#667085"
                strokeWidth="0.2"
                mask="url(#path-5-outside-1_1192_12494)"
              />
            </svg>
          </div>
        </div>
        <div className="flex justify-between pt-2">
          <div className="relative h-7 w-full rounded-full bg-gray-100">
            <div className="absolute h-full rounded-l-full bg-gray-900"></div>
            <div className="relative flex h-full items-center justify-between px-2">
              <span className="text-sm font-semibold text-primary-500">
                {product.positiveCommunityReactionCount}%
              </span>
              <span className="right-2 text-sm text-gray-500">
                {product.negativeCommunityReactionCount}%
              </span>
            </div>
          </div>
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
