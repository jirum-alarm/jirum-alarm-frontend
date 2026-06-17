import type { Meta, StoryObj } from '@storybook/react';

/**
 * 디자인 토큰 typography 카탈로그. Figma 14종을 실제 typography-* 유틸로 표시.
 * SSOT: packages/design-tokens/tokens/primitive/typography.json.
 */
const meta = {
  title: 'design-system/Typography',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const TYPES: { cls: string; spec: string }[] = [
  { cls: 'typography-headline-28sb', spec: '28 / 38 / SemiBold' },
  { cls: 'typography-headline-24sb', spec: '24 / 36 / SemiBold' },
  { cls: 'typography-headline-20sb', spec: '20 / 32 / SemiBold' },
  { cls: 'typography-headline-20m', spec: '20 / 32 / Medium' },
  { cls: 'typography-title-18b', spec: '18 / 32 / Bold' },
  { cls: 'typography-title-16sb', spec: '16 / 24 / SemiBold' },
  { cls: 'typography-title-16m', spec: '16 / 24 / Medium' },
  { cls: 'typography-title-16r', spec: '16 / 24 / Regular' },
  { cls: 'typography-body-14sb', spec: '14 / 20 / SemiBold' },
  { cls: 'typography-body-14m', spec: '14 / 20 / Medium' },
  { cls: 'typography-body-14r', spec: '14 / 20 / Regular' },
  { cls: 'typography-caption-13m', spec: '13 / 18 / Medium' },
  { cls: 'typography-caption-13r', spec: '13 / 18 / Regular' },
  { cls: 'typography-caption-12m', spec: '12 / 16 / Medium' },
];

export const All: Story = {
  render: () => (
    <div className="flex flex-col gap-5 p-8">
      <h2 className="typography-headline-20sb text-fg-primary">Typography (Figma 14종)</h2>
      {TYPES.map(({ cls, spec }) => (
        <div key={cls} className="border-border-subtle flex flex-col gap-1 border-b pb-4">
          <div className="flex items-baseline gap-3">
            <span className="typography-caption-12m text-fg-tertiary w-56 shrink-0">{cls}</span>
            <span className="typography-caption-12m text-fg-secondary">{spec}</span>
          </div>
          <p className={`${cls} text-fg-primary`}>지름알림 핫딜 알림 Aa 가나다 123</p>
        </div>
      ))}
    </div>
  ),
};
