import { useState } from 'react';

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
};

export const Disabled: Story = {
  args: { checked: false, disabled: true, onCheckedChange: () => {}, 'aria-label': '야간 알림' },
};
