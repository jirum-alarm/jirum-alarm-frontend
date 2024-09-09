import type { Meta, StoryObj } from '@storybook/react';

import { Toast } from './Toast';

const meta = {
  title: 'components/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="grid h-20">
      <Toast show>확인되었습니다.</Toast>
    </div>
  ),
};
