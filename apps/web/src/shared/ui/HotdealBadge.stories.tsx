import { HotDealType } from '@/shared/api/gql/graphql';
import { HOTDEAL_TYPES_IN_ORDER, hotdealCriteria } from '@/shared/config/hotdeal';

import HotdealBadge from './HotdealBadge';

import type { Meta, StoryObj } from '@storybook/react';

/** 핫딜·대박·초대박 등급 표시(그라데이션 그림). 등급 기준은 서버 hot-deal-criteria 와 shared/config/hotdeal. */
const meta = {
  title: 'components/HotdealBadge',
  component: HotdealBadge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    hotdealType: { control: 'inline-radio', options: HOTDEAL_TYPES_IN_ORDER },
    badgeVariant: { control: 'inline-radio', options: ['page', 'card', 'cardSquare'] },
  },
} satisfies Meta<typeof HotdealBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { hotdealType: HotDealType.SuperDeal, badgeVariant: 'page' },
};

/** 등급 × 놓이는 자리 — page = 상세 제목 옆, card = 둥근 사진 틀 왼쪽 아래, cardSquare = 각진 사진(랭킹). */
export const All: Story = {
  args: { hotdealType: HotDealType.HotDeal, badgeVariant: 'page' },
  render: () => (
    <div className="flex flex-col gap-4">
      {HOTDEAL_TYPES_IN_ORDER.map((type) => (
        <div key={type} className="flex items-center gap-3">
          <HotdealBadge hotdealType={type} badgeVariant="page" />
          <HotdealBadge hotdealType={type} badgeVariant="card" />
          <HotdealBadge hotdealType={type} badgeVariant="cardSquare" />
          <span className="text-sm text-gray-600">{hotdealCriteria[type].short}</span>
        </div>
      ))}
    </div>
  ),
};
