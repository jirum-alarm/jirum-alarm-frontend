import { catalog } from '@jirum/design-system/catalog';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

type Entry = (typeof catalog)[number];

/** Storybook 이 제목으로 만드는 스토리 id 와 같은 규칙(소문자·구분자 → -). */
const storyPath = (title: string) =>
  title
    .toLowerCase()
    .replace(/[ ’–—―′¿'`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const Where = ({ path }: { path: string | null }) =>
  path ? (
    <code className="text-xs break-all text-gray-700">
      {path.replace(/^apps\/(web|mobile)\/src\//, '')}
    </code>
  ) : (
    <span className="text-xs text-gray-500">—</span>
  );

const Row = ({ e }: { e: Entry }) => (
  <tr className="border-t border-gray-200 align-top">
    <td className="py-3 pr-4">
      <a
        className="text-secondary-600 text-sm font-semibold underline"
        href={`?path=/docs/${storyPath(e.story)}--docs`}
        target="_top"
      >
        {e.name}
      </a>
      <div className="text-xs text-gray-500">{e.id}</div>
    </td>
    <td className="py-3 pr-4 text-sm text-gray-800">{e.use}</td>
    <td className="py-3 pr-4">
      {e.recipe ? (
        <code className="text-xs text-gray-700">{e.recipe}</code>
      ) : (
        <span className="text-xs text-gray-500">—</span>
      )}
    </td>
    <td className="py-3 pr-4">
      <Where path={e.web} />
    </td>
    <td className="py-3">
      <Where path={e.app} />
    </td>
  </tr>
);

const CatalogTable = () => (
  <div className="max-w-5xl">
    <h1 className="mb-1 text-2xl font-bold">부품 지도</h1>
    <p className="mb-6 text-sm text-gray-600">
      필요한 조각이 이미 있는지 여기서 먼저 찾는다. 이름을 누르면 그 부품을 만져 볼 수 있다. 목록의
      원본은 <code>packages/design-system/catalog.js</code> — 부품을 만들면 거기 한 줄 넣는다(빠지면
      테스트가 막는다).
    </p>
    <table className="w-full text-left">
      <thead>
        <tr className="text-xs text-gray-600">
          <th className="pb-2 font-semibold">부품</th>
          <th className="pb-2 font-semibold">언제</th>
          <th className="pb-2 font-semibold">레시피</th>
          <th className="pb-2 font-semibold">web</th>
          <th className="pb-2 font-semibold">앱</th>
        </tr>
      </thead>
      <tbody>
        {catalog.map((e) => (
          <Row key={e.id} e={e} />
        ))}
      </tbody>
    </table>
  </div>
);

const meta = {
  title: '소개/부품 지도',
  component: CatalogTable,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof CatalogTable>;

export default meta;
export const All: StoryObj<typeof meta> = { name: '전체' };
