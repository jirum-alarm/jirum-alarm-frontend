import { HotDealType } from '@/shared/api/gql/graphql';

import { type ProductCardType } from '@/entities/product-list/model/types';
import CarouselProductCard from '@/entities/product-list/ui/carousel/CarouselProductCard';
import ListProductCard from '@/entities/product-list/ui/list/ListProductCard';

import ProductGridCard from './ProductGridCard';

import type { Meta, StoryObj } from '@storybook/react';

// 사진은 비워 둔다 — 「사진 없음」 자리표시가 그려져 네트워크 없이도 카드 틀을 본다.
const base: ProductCardType = {
  id: '1',
  title: '제주 삼다수 2L 12병 무료배송 (로켓와우 전용)',
  price: '9,900원',
  thumbnail: null,
  postedAt: new Date('2026-10-16T09:00:00+09:00'),
  categoryId: 1,
  mallName: '쿠팡',
  provider: { nameKr: '뽐뿌' },
};

const products: ProductCardType[] = [
  base,
  {
    ...base,
    id: '2',
    title: '에어팟 프로 2 USB-C',
    price: '259,000원',
    hotDealType: HotDealType.SuperDeal,
  },
  { ...base, id: '3', title: '햇반 210g 36개', price: '29,800원', isEnd: true, mallName: null },
];

/**
 * 상품 카드 — 그리드(2·3열, 가격 16px)·캐러셀(120px, 18px)·목록. 글자 모양은 recipes `productCard` 한 곳이고
 * 앱 카드(ProductCard·HomeCardPrimitives)가 같은 값을 읽는다.
 */
const meta = {
  title: 'components/ProductCard',
  component: ProductGridCard,
  parameters: { layout: 'padded' },
  args: { product: base },
} satisfies Meta<typeof ProductGridCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Grid: Story = {
  render: () => (
    <div className="grid w-[360px] grid-cols-2 gap-x-3 gap-y-5">
      {products.map((p) => (
        <ProductGridCard key={p.id} product={p} />
      ))}
    </div>
  ),
};

export const Carousel: Story = {
  render: () => (
    <div className="flex gap-x-3">
      {products.map((p) => (
        <CarouselProductCard key={p.id} product={p} />
      ))}
    </div>
  ),
};

export const List: Story = {
  render: () => (
    <div className="flex w-[360px] flex-col gap-y-3">
      {products.map((p) => (
        <ListProductCard key={p.id} product={p} />
      ))}
    </div>
  ),
};
