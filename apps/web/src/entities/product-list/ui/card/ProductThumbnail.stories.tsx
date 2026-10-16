import { cardThumb } from '@jirum/design-system/recipes';

import ProductThumbnail from './ProductThumbnail';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * 상품 사진 — 부모가 크기(aspect-square 등)와 relative 를 가져야 한다. 사진이 없거나 깨지면 카테고리 그림(NoImage).
 * 틀은 recipes `cardThumb`. 앱은 shared/components/product/Thumbnail.
 */
const meta = {
  title: 'components/ProductThumbnail',
  component: ProductThumbnail,
  parameters: { layout: 'centered' },
  args: { alt: '상품 사진', type: 'product', sizes: '160px' },
  decorators: [
    (Story) => (
      <div className={`relative size-40 ${cardThumb}`}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProductThumbnail>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 사진이 없을 때 — 카테고리별 그림. */
export const NoImage: Story = { args: { src: '', categoryId: 1 } };
export const NoImageOtherCategory: Story = { args: { src: '', categoryId: 7 } };
