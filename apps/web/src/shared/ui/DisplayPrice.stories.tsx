import DisplayPrice from './DisplayPrice';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * 상세의 큰 가격(숫자 24px + 원 18px, PC 는 한 단계 크게). 목록 카드 가격은 이것이 아니라 recipes `productCard.price`.
 * 앱 shared/components/product/DisplayPrice 가 같은 크기.
 */
const meta = {
  title: 'components/DisplayPrice',
  component: DisplayPrice,
  parameters: { layout: 'centered' },
  args: { price: '129,000원' },
} satisfies Meta<typeof DisplayPrice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Won: Story = {};
export const WithNote: Story = { args: { price: '9,900원 (와우 회원가)' } };
export const Text: Story = { args: { price: '가격 미정' } };
