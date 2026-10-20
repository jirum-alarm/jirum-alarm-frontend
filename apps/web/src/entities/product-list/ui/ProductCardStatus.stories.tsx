import { cardThumb } from '@jirum/design-system/recipes';

import { HotDealType } from '@/shared/api/gql/graphql';
import { cn } from '@/shared/lib/cn';

import { ProductCardStatus } from './ProductCardStatus';

import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentProps } from 'react';

/**
 * 상품 카드 사진 위 판매종료·베스트판매자·유통기한 띠·토스 선착순·급상승. 카드 종류와 무관하게 이것만 쓴다 —
 * 같은 상품이 화면마다 다르게 보이면 버그로 읽힌다. 유통기한 띠가 있으면 핫딜 배지는 숨긴다.
 */
const meta = {
  title: 'components/ProductCardStatus',
  component: ProductCardStatus,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof ProductCardStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

type Product = ComponentProps<typeof ProductCardStatus>['product'];

const HOUR = 3_600_000;

const base: Product = {
  isEnd: false,
  hotDealType: null,
  earliestExpiryDate: null,
  isRising: false,
  data: null,
  title: '삼다수 2L 24병',
  postedAt: new Date(),
};

/** 토스 하루특가 창 — 지금 기준으로 시작·끝 시각을 만든다(시각이 지나면 배지가 사라지므로). */
const toss = (dealStatus: 'ON_GOING' | 'SOLD_OUT', startOffsetHours = -1) => ({
  toss: {
    todayDealStartAt: new Date(Date.now() + startOffsetHours * HOUR).toISOString(),
    todayDealEndAt: new Date(Date.now() + 10 * HOUR).toISOString(),
    dealStatus,
  },
});

/** 사진 틀(cardThumb) 안에 놓아 실제 카드와 같은 자리에서 본다. */
const Thumb = ({
  label,
  ...props
}: ComponentProps<typeof ProductCardStatus> & { label: string }) => (
  <figure className="flex flex-col gap-1">
    <div
      className={cn(
        'relative size-32',
        cardThumb,
        props.squareThumb && 'rounded-b-none border-b-0',
      )}
    >
      <ProductCardStatus {...props} />
    </div>
    <figcaption className="text-xs text-gray-600">{label}</figcaption>
  </figure>
);

export const Default: Story = {
  args: { product: { ...base, hotDealType: HotDealType.SuperDeal } },
  render: (args) => <Thumb {...args} label="대박딜" />,
};

export const All: Story = {
  args: { product: base },
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <Thumb label="핫딜" product={{ ...base, hotDealType: HotDealType.HotDeal }} />
      <Thumb label="초대박딜" product={{ ...base, hotDealType: HotDealType.UltraDeal }} />
      <Thumb
        label="판매종료"
        product={{ ...base, isEnd: true, hotDealType: HotDealType.HotDeal }}
      />
      <Thumb
        label="유통기한 띠(배지 숨김)"
        product={{
          ...base,
          hotDealType: HotDealType.HotDeal,
          earliestExpiryDate: new Date('2026-12-31'),
        }}
      />
      <Thumb label="토스 선착순특가" product={{ ...base, data: toss('ON_GOING') }} />
      <Thumb label="토스 선착순 마감" product={{ ...base, isEnd: true, data: toss('SOLD_OUT') }} />
      <Thumb label="오픈 예고" product={{ ...base, data: toss('ON_GOING', 5) }} />
      <Thumb label="급상승(랭킹)" product={{ ...base, isRising: true }} />
      <Thumb
        label="기준가 대비 + 1년 최저가"
        product={{
          ...base,
          hotDealType: HotDealType.SuperDeal,
          isYearLowest: true,
          priceSaving: { basis: 'COUPANG', percent: 21 },
        }}
      />
      <Thumb
        label="각진 사진(랭킹)"
        squareThumb
        product={{ ...base, hotDealType: HotDealType.SuperDeal }}
      />
    </div>
  ),
};
