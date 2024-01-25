import type { Meta, StoryObj } from '@storybook/react';
import { Illust } from './Illust';

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
