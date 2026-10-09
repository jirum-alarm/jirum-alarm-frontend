import { Skeleton } from './Skeleton';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'components/Skeleton',
  component: Skeleton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { className: 'h-4 w-40 rounded-sm' },
};

// 크기·모서리는 실제 요소와 맞춘다 — ProductImageCardSkeleton 과 같은 상품 카드 자리.
export const ProductCard: Story = {
  render: () => (
    <div className="grid w-40 gap-y-2">
      <Skeleton className="aspect-square rounded-lg" />
      <Skeleton className="h-4 rounded-sm" />
      <Skeleton className="h-4 w-1/2 rounded-sm" />
      <Skeleton className="h-6 w-2/3 rounded-sm" />
    </div>
  ),
};
