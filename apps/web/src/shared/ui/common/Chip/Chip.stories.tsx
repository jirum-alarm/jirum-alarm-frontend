import { useState } from 'react';

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
};
