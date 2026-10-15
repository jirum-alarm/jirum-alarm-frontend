import { brand, chart, dark, light } from '@jirum/design-system';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

type Scale = Record<string, string>;

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** 바탕(white) 위 글자로 쓸 때의 대비 — 라이트·다크 각각. 4.5 미만은 글자 금지(면·선·아이콘만). */
const Ratio = ({ fg, bg }: { fg: string; bg: string }) => {
  const r = ratio(fg, bg);
  return <span className={r >= 4.5 ? 'text-gray-700' : 'text-error-600'}>{r.toFixed(1)}</span>;
};

const ScaleRow = ({
  name,
}: {
  name: 'gray' | 'primary' | 'secondary' | 'error' | 'success' | 'warning';
}) => {
  const l = light[name] as Scale;
  const d = dark[name] as Scale;
  return (
    <div className="mb-6">
      <h2 className="mb-2 text-sm font-semibold">{name}</h2>
      <div className="grid grid-cols-5 gap-2 md:grid-cols-10">
        {Object.keys(l).map((step) => (
          <div key={step}>
            <div
              className="h-12 rounded-lg border border-gray-200"
              style={{ backgroundColor: `var(--color-${name}-${step})` }}
            />
            <div className="mt-1 text-xs font-medium">{step}</div>
            <div className="text-10 text-gray-600">
              {l[step]} / {d[step]}
            </div>
            <div className="text-10 text-gray-600">
              대비 <Ratio fg={l[step]} bg={light.white} /> · <Ratio fg={d[step]} bg={dark.white} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const USAGE: [string, string, string][] = [
  ['화면 바탕', 'bg-white', '다크에선 가장 어두운 면'],
  ['카드·연한 면', 'bg-gray-50', ''],
  ['본문 글자', 'text-gray-900', '부제 700·600'],
  ['보조 글자', 'text-gray-500', '최저선. gray-400 은 글자 금지'],
  ['브랜드 강조', 'bg-primary-500 text-fixed-900', '라임 위 흰 글자 금지'],
  ['링크·정보·선택됨', 'text-secondary-600', ''],
  ['싸다·할인·오류', 'text-error-600', '일반 가격은 gray-900'],
  ['좋음', 'bg-success-50 text-success-700', ''],
  ['주의', 'bg-warning-50 text-warning-700', ''],
  ['테마 무관(사진 위 배지)', 'bg-fixed-900 text-fixed-white', ''],
];

const PaletteView = () => (
  <div className="max-w-5xl">
    <h1 className="mb-1 text-2xl font-bold">색</h1>
    <p className="mb-6 text-sm text-gray-600">
      값은 <code>tokens.js</code> 한 곳. 칸 아래는 라이트 / 다크 값과, 바탕 위 글자로 쓸 때의
      대비(라이트 · 다크). 빨간 숫자는 4.5 미만 = 글자로 쓰지 않는다. 툴바 「테마」를 바꾸면 칸이
      다크 값으로 바뀐다.
    </p>
    {(['gray', 'primary', 'secondary', 'error', 'success', 'warning'] as const).map((n) => (
      <ScaleRow key={n} name={n} />
    ))}
    <h2 className="mt-8 mb-3 text-lg font-bold">쓰임새 → 토큰</h2>
    <div className="flex flex-col gap-2">
      {USAGE.map(([what, cls, note]) => (
        <div key={what} className="flex items-center gap-3">
          <span className={`w-40 shrink-0 rounded-lg px-3 py-2 text-sm ${cls}`}>{what}</span>
          <code className="text-xs text-gray-700">{cls}</code>
          {note && <span className="text-xs text-gray-600">{note}</span>}
        </div>
      ))}
    </div>
    <h2 className="mt-8 mb-3 text-lg font-bold">외부 브랜드</h2>
    <div className="flex gap-3">
      {Object.entries(brand)
        .filter(([k]) => k === 'kakao' || k === 'naver')
        .map(([k, v]) => (
          <div key={k} className="text-xs">
            <div className="h-10 w-24 rounded-lg" style={{ backgroundColor: v }} />
            {k} {v}
          </div>
        ))}
    </div>
  </div>
);

const CHART_USE: Record<keyof typeof chart, string> = {
  line: '가격 선·면',
  current: '지금 보는 상품 점',
  guide: '기준선',
  low: '최저가',
  high: '최고가',
  grid: '격자·축선',
  axis: '축 글자',
};

const ChartColors = () => (
  <div className="max-w-xl">
    <h1 className="mb-1 text-2xl font-bold">차트 색</h1>
    <p className="mb-4 text-sm text-gray-600">
      역할 이름으로 쓴다 — web 은 <code>chartVar(&apos;line&apos;)</code>(CSS 변수라 다크 자동),
      앱은 <code>chartColor(&apos;line&apos;, useColors())</code>. 정상·좋음 = secondary, 최저·나쁨
      = error, 중립 = gray.
    </p>
    <div className="flex flex-col gap-2">
      {(Object.keys(chart) as (keyof typeof chart)[]).map((role) => (
        <div key={role} className="flex items-center gap-3">
          <div
            className="h-6 w-16 rounded-sm"
            style={{ backgroundColor: `var(--color-${chart[role]})` }}
          />
          <code className="w-20 text-sm">{role}</code>
          <span className="w-28 text-xs text-gray-700">{chart[role]}</span>
          <span className="text-sm text-gray-800">{CHART_USE[role]}</span>
        </div>
      ))}
    </div>
  </div>
);

const meta = { title: '기초/색', parameters: { layout: 'fullscreen' } } satisfies Meta;
export default meta;

export const Palette: StoryObj = { name: '팔레트', render: () => <PaletteView /> };
export const Chart: StoryObj = { name: '차트', render: () => <ChartColors /> };
