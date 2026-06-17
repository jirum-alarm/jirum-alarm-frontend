import type { Meta, StoryObj } from '@storybook/react';

/**
 * 디자인 토큰 색 카탈로그. 원시 스케일 + 시맨틱(fg/surface/border)을 한눈에.
 * SSOT: packages/design-tokens. 클래스를 직접 써서 "살아있는" 카탈로그(토큰 바뀌면 여기도 바뀜).
 */
const meta = {
  title: 'design-system/Colors',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const PRIMITIVE: { group: string; shades: string[] }[] = [
  {
    group: 'primary',
    shades: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
  },
  {
    group: 'secondary',
    shades: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
  },
  { group: 'gray', shades: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { group: 'error', shades: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] },
];

const SEMANTIC: { label: string; items: { name: string; cls: string }[] }[] = [
  {
    label: 'fg (텍스트)',
    items: [
      { name: 'primary', cls: 'bg-fg-primary' },
      { name: 'secondary', cls: 'bg-fg-secondary' },
      { name: 'secondary-strong', cls: 'bg-fg-secondary-strong' },
      { name: 'tertiary', cls: 'bg-fg-tertiary' },
      { name: 'disabled', cls: 'bg-fg-disabled' },
      { name: 'inverse', cls: 'bg-fg-inverse' },
      { name: 'brand', cls: 'bg-fg-brand' },
      { name: 'error', cls: 'bg-fg-error' },
      { name: 'error-strong', cls: 'bg-fg-error-strong' },
      { name: 'link', cls: 'bg-fg-link' },
    ],
  },
  {
    label: 'surface (배경)',
    items: [
      { name: 'default', cls: 'bg-surface-default' },
      { name: 'subtle', cls: 'bg-surface-subtle' },
      { name: 'muted', cls: 'bg-surface-muted' },
      { name: 'brand', cls: 'bg-surface-brand' },
      { name: 'inverse', cls: 'bg-surface-inverse' },
      { name: 'error', cls: 'bg-surface-error' },
      { name: 'disabled', cls: 'bg-surface-disabled' },
    ],
  },
  {
    label: 'border (테두리)',
    items: [
      { name: 'default', cls: 'bg-border-default' },
      { name: 'strong', cls: 'bg-border-strong' },
      { name: 'subtle', cls: 'bg-border-subtle' },
      { name: 'brand', cls: 'bg-border-brand' },
      { name: 'interactive', cls: 'bg-border-interactive' },
      { name: 'focus', cls: 'bg-border-focus' },
    ],
  },
];

const Swatch = ({ cls, name }: { cls: string; name: string }) => (
  <div className="flex flex-col items-center gap-1">
    <div className={`border-border-default h-12 w-12 rounded-md border ${cls}`} />
    <span className="typography-caption-12m text-fg-secondary">{name}</span>
  </div>
);

export const Primitive: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-8">
      <h2 className="typography-headline-20sb text-fg-primary">원시 스케일 (primitive)</h2>
      {PRIMITIVE.map(({ group, shades }) => (
        <div key={group} className="flex flex-col gap-2">
          <span className="typography-body-14sb text-fg-primary">{group}</span>
          <div className="flex flex-wrap gap-2">
            {shades.map((s) => (
              <Swatch key={s} cls={`bg-${group}-${s}`} name={s} />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Semantic: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-8">
      <h2 className="typography-headline-20sb text-fg-primary">시맨틱 (semantic)</h2>
      {SEMANTIC.map(({ label, items }) => (
        <div key={label} className="flex flex-col gap-2">
          <span className="typography-body-14sb text-fg-primary">{label}</span>
          <div className="flex flex-wrap gap-3">
            {items.map((it) => (
              <Swatch key={it.name} cls={it.cls} name={it.name} />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};
