import { Illust } from './Illust';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'components/Illust',
  component: Illust,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Illust>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'md',
  },
};
