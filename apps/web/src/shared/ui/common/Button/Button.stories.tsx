import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from './Button';

import type { Meta, StoryObj } from '@storybook/react';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'components/Button',
  component: Button,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      defaultValue: false,
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {
    children: <div>다음</div>,
  },
};
export const Filled: Story = {
  args: {
    variant: 'filled',
    disabled: false,
    children: <div>다음</div>,
  },
};
/** 비활성 버튼은 눌러도 onClick 이 불리지 않는다. */
export const Disabled: Story = {
  args: { disabled: true, onClick: fn(), children: '다음' },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: '다음' }), {
      pointerEventsCheck: 0,
    });
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

/** 눌리면 onClick 이 한 번 불린다. */
export const Clickable: Story = {
  args: { onClick: fn(), children: '다음' },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: '다음' }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    disabled: false,
    children: <div>다음</div>,
  },
};
