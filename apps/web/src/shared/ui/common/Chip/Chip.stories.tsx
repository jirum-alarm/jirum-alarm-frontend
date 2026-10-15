import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Chip } from './Chip';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'components/Chip',
  component: Chip,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: '전체', selected: true } };

/** 골라도 칩 너비가 변하지 않는다 — 눌러서 옆 칩이 밀리지 않는지 볼 것. */
export const Row: Story = {
  args: { children: '' },
  render: () => {
    const Demo = () => {
      const [selected, setSelected] = useState('전체');
      return (
        <div className="flex flex-col gap-3">
          {(['md', 'sm', 'xs'] as const).map((size) => (
            <div key={size} className="flex gap-2">
              {['전체', '디지털', '식품', '생활용품'].map((label) => (
                <Chip
                  key={label}
                  size={size}
                  selected={selected === label}
                  onClick={() => setSelected(label)}
                >
                  {label}
                </Chip>
              ))}
            </div>
          ))}
        </div>
      );
    };
    return <Demo />;
  },
  // 고르면 aria-pressed 가 옮겨 가고, 굵어져도 너비는 그대로다(옆 칩이 밀리지 않는다).
  play: async ({ canvasElement }) => {
    const [food] = within(canvasElement).getAllByRole('button', { name: '식품' });
    const before = food.getBoundingClientRect().width;
    await userEvent.click(food);
    await expect(food).toHaveAttribute('aria-pressed', 'true');
    await expect(within(canvasElement).getAllByRole('button', { name: '전체' })[0]).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await expect(food.getBoundingClientRect().width).toBe(before);
  },
};
