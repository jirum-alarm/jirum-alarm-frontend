import { tab } from '@jirum/design-system/recipes';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

type Tone = 'neutral' | 'brand' | 'segment';
type Size = keyof typeof tab.size;

/** 레시피를 그대로 읽어 그리는 탭 한 줄 — web 은 각 자리 `<button>`, 앱은 TabPill 이 같은 클래스를 쓴다. */
const TabRow = ({ tone, size, items }: { tone: Tone; size: Size; items: string[] }) => {
  const [selected, setSelected] = useState(items[0]);
  return (
    <div role="tablist" aria-label={`${tone} 탭`} className="flex gap-2">
      {items.map((item) => {
        const state = item === selected ? tab[tone].selected : tab[tone].idle;
        return (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={item === selected}
            onClick={() => setSelected(item)}
            className={`flex items-center ${tab.size[size]} ${state.box} ${state.text} ${state.hover}`}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
};

const meta = {
  title: '레시피/탭',
  component: TabRow,
  parameters: {
    docs: {
      description: {
        component:
          '목록 전환(면을 채워 고른 것 표시). neutral = 커뮤니티·토스·큐레이션, brand = 랭킹·핫딜 모음 카테고리(라임), segment = 기간 고르기. 필터는 고르는 칩(테두리).',
      },
    },
  },
  args: { tone: 'neutral', size: 'md', items: ['전체', '인기', '공지'] },
  argTypes: {
    tone: { control: 'inline-radio', options: ['neutral', 'brand', 'segment'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof TabRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: '인기' }));
    await expect(canvas.getByRole('tab', { name: '인기' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(canvas.getByRole('tab', { name: '전체' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  },
};

export const Brand: Story = { args: { tone: 'brand', items: ['전체', '디지털', '식품', '생활'] } };

export const Segment: Story = {
  args: { tone: 'segment', size: 'sm', items: ['1개월', '3개월', '1년'] },
};

/** 세 모양 × 두 크기. */
export const All: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(['neutral', 'brand', 'segment'] as const).flatMap((tone) =>
        (['md', 'sm'] as const).map((size) => (
          <TabRow
            key={`${tone}-${size}`}
            tone={tone}
            size={size}
            items={['전체', '디지털', '식품']}
          />
        )),
      )}
    </div>
  ),
};
