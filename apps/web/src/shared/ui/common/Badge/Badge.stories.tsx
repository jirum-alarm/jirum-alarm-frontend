import { Badge } from './Badge';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'components/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: '도착보장', tone: 'success' } };

/** 모든 조합 — 모양의 원본은 packages/design-system/recipes.js(앱 Badge 와 같은 클래스). */
export const All: Story = {
  args: { children: '' },
  render: () => (
    <div className="flex flex-col gap-3">
      {(['xs', 'sm', 'md'] as const).map((size) => (
        <div key={size} className="flex items-center gap-2">
          <Badge size={size}>평소 수준</Badge>
          <Badge size={size} tone="secondary">
            핫딜
          </Badge>
          <Badge size={size} tone="success">
            지금 추천
          </Badge>
          <Badge size={size} tone="warning">
            증정·번들
          </Badge>
          <Badge size={size} tone="error">
            역대 최저
          </Badge>
          <Badge size={size} variant="solid" tone="secondary">
            NEW
          </Badge>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <Badge pill tone="success">
          역대 최저 · 9%↓
        </Badge>
        <Badge pill tone="warning">
          평소보다 비싸요
        </Badge>
        <Badge size="tag" variant="outline">
          판매종료
        </Badge>
        <Badge size="tag" variant="solid" tone="error">
          핫딜
        </Badge>
      </div>
    </div>
  ),
};
