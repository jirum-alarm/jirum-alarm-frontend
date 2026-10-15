import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const RADII: [string, string, string][] = [
  ['rounded-xs', '2', ''],
  ['rounded-sm', '4', '정보 태그'],
  ['rounded-md', '6', ''],
  ['rounded-lg', '8', '버튼·카드 사진·상태 태그'],
  ['rounded-xl', '12', '정보 상자·토스트'],
  ['rounded-2xl', '16', ''],
  ['rounded-sheet', '20', '바텀시트 윗모서리'],
  ['rounded-3xl', '24', ''],
  ['rounded-full', '∞', '알약·원·칩'],
];

const SHADOWS: [string, string][] = [
  ['shadow-card', '카드 경계(카드엔 테두리가 없어 이게 유일한 경계)'],
  ['shadow-sm', ''],
  ['shadow-md', ''],
  ['shadow-lg', '떠 있는 버튼'],
];

const Shapes = () => (
  <div className="max-w-3xl">
    <h1 className="mb-1 text-2xl font-bold">모서리 · 그림자</h1>
    <p className="mb-6 text-sm text-gray-600">
      값은 web(Tailwind v4)과 앱(NativeWind v3)이 같다 — 예전엔 같은 <code>rounded-sm</code> 이 web
      4px·앱 2px 였다.
    </p>
    <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
      {RADII.map(([cls, px, use]) => (
        <div key={cls}>
          <div className={`${cls} bg-secondary-100 h-16 w-full`} />
          <code className="mt-1 block text-xs">{cls}</code>
          <span className="text-xs text-gray-600">
            {px}
            {use && ` · ${use}`}
          </span>
        </div>
      ))}
    </div>
    <h2 className="mt-8 mb-3 text-lg font-bold">그림자</h2>
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {SHADOWS.map(([cls, use]) => (
        <div key={cls}>
          <div className={`${cls} h-16 rounded-lg bg-white`} />
          <code className="mt-2 block text-xs">{cls}</code>
          <span className="text-xs text-gray-600">{use}</span>
        </div>
      ))}
    </div>
    <p className="mt-4 text-xs text-gray-600">
      앱(iOS)은 그림자와 overflow-hidden 이 같은 View 에 공존하지 못한다 — 그림자 View 와 자르는
      View 를 나눈다.
    </p>
  </div>
);

const meta = { title: '기초/모서리·그림자', parameters: { layout: 'fullscreen' } } satisfies Meta;
export default meta;
export const All: StoryObj = { name: '전체', render: () => <Shapes /> };
