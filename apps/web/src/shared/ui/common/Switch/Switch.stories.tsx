import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Switch } from './Switch';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'components/Switch',
  component: Switch,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { checked: true, onCheckedChange: () => {}, 'aria-label': '키워드 알림' },
  render: (args) => {
    const Demo = () => {
      const [checked, setChecked] = useState(args.checked);
      return <Switch {...args} checked={checked} onCheckedChange={setChecked} />;
    };
    return <Demo />;
  },
  // 누르면 켜짐↔꺼짐이 바뀌고, 스크린리더가 읽는 상태(aria-checked)도 같이 바뀐다.
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole('switch', { name: '키워드 알림' });
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
  },
};

export const Disabled: Story = {
  args: { checked: false, disabled: true, onCheckedChange: fn(), 'aria-label': '야간 알림' },
  // 비활성이면 눌러도 바뀌지 않는다.
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('switch', { name: '야간 알림' }), {
      pointerEventsCheck: 0,
    });
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};
