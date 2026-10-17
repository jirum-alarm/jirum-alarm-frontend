import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ComponentType } from 'react';

// web 아이콘 폴더의 파일을 전부 모은다 — 새 아이콘을 넣으면 여기 따로 등록하지 않아도 나온다.
// 다크(툴바 「테마」)에서 바탕에 묻히는 아이콘을 찾는 자리: 회색 hex 를 박은 아이콘은 다크에서 안 뒤집힌다.
const modules = import.meta.glob<{ default: ComponentType<{ className?: string }> }>(
  ['../../../web/src/shared/ui/common/icons/**/*.tsx', '!**/*.stories.tsx'],
  { eager: true },
);

const ROOT = '../../../web/src/shared/ui/common/icons/';

const groups = Object.entries(modules).reduce<Record<string, [string, ComponentType][]>>(
  (acc, [path, mod]) => {
    const rel = path.slice(ROOT.length).replace(/\.tsx$/, '');
    const dir = rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/')) : '기본';
    if (typeof mod.default === 'function' || typeof mod.default === 'object') {
      (acc[dir] ??= []).push([rel.slice(rel.lastIndexOf('/') + 1), mod.default]);
    }
    return acc;
  },
  {},
);

const Icons = () => (
  <div className="max-w-5xl">
    <h1 className="mb-1 text-2xl font-bold">아이콘</h1>
    <p className="mb-6 text-sm text-gray-600">
      한 색 아이콘은 <code>currentColor</code> 로 그려 글자 색(<code>text-gray-900</code> 등)을
      따른다. 회색을 hex 로 박으면 다크에서 안 뒤집혀 바탕에 묻힌다 — 회색은{' '}
      <code>var(--color-gray-N)</code>, 브랜드·그림 색만 hex(린트가 검정·회색 토큰 값의 hex 를
      막는다).
    </p>
    {Object.entries(groups)
      .sort(([a], [b]) => (a === '기본' ? -1 : b === '기본' ? 1 : a.localeCompare(b)))
      .map(([dir, items]) => (
        <section key={dir} className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">{dir}</h2>
          <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
            {items.map(([name, Icon]) => (
              <div
                key={name}
                className="flex flex-col items-center gap-2 rounded-lg border border-gray-100 p-3"
              >
                <div className="flex h-12 w-full items-center justify-center text-gray-900 [&>svg]:max-h-12 [&>svg]:max-w-full">
                  <Icon />
                </div>
                <span className="text-11 w-full truncate text-center text-gray-600">{name}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
  </div>
);

const meta = {
  title: '기초/아이콘',
  component: Icons,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Icons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {};
