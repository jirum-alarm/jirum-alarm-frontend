import type { Meta, StoryObj } from '@storybook/nextjs-vite';

// 클래스는 문자열 그대로 적는다 — Tailwind 가 소스 글자를 훑어 CSS 를 만들기 때문(조합해 만들면 안 생긴다).
const SIZES: [string, string, string][] = [
  ['text-10', '10', '아주 작은 정보 태그(배지 xs)'],
  ['text-11', '11', '작은 정보 태그(배지 sm)'],
  ['text-xs', '12 / 16', '보조 정보·캡션'],
  ['text-13', '13', '카드 부가 정보'],
  ['text-sm', '14 / 20', '목록·칩·본문 보조'],
  ['text-15', '15', '카드 제목'],
  ['text-base', '16 / 24', '본문·버튼'],
  ['text-lg', '18 / 28', '섹션 제목'],
  ['text-xl', '20 / 28', '화면 제목'],
  ['text-22', '22', '큰 가격'],
  ['text-2xl', '24 / 32', '빈 화면 제목'],
  ['text-28', '28', 'PC 섹션 제목'],
];

const WEIGHTS = ['font-normal', 'font-medium', 'font-semibold', 'font-bold'];

const Type = () => (
  <div className="max-w-3xl">
    <h1 className="mb-1 text-2xl font-bold">글자</h1>
    <p className="mb-6 text-sm text-gray-600">
      Tailwind 이름(크기+줄높이)이 기본, 그 사이 크기만 숫자 토큰(이름 = px, 줄높이는 부모를 따름).
      10px 아래는 쓰지 않는다. 30px 이상(히어로)만 임의 값 허용.
    </p>
    <div className="flex flex-col">
      {SIZES.map(([cls, px, use]) => (
        <div key={cls} className="flex items-baseline gap-4 border-t border-gray-200 py-3">
          <code className="w-20 shrink-0 text-xs text-gray-700">{cls}</code>
          <span className="w-14 shrink-0 text-xs text-gray-600">{px}</span>
          <span className={`${cls} flex-1 text-gray-900`}>지름알림 핫딜 129,000원</span>
          <span className="w-40 shrink-0 text-xs text-gray-600">{use}</span>
        </div>
      ))}
    </div>
    <h2 className="mt-8 mb-3 text-lg font-bold">굵기</h2>
    <div className="flex flex-col gap-2">
      {WEIGHTS.map((w) => (
        <div key={w} className="flex items-baseline gap-4">
          <code className="w-28 text-xs text-gray-700">{w}</code>
          <span className={`${w} text-base`}>오늘의 핫딜 모아보기</span>
        </div>
      ))}
    </div>
    <p className="mt-4 text-xs text-gray-600">
      <code>text-semibold</code> 는 Tailwind 에 없는 클래스라 효과가 없다(린트가 막는다). 앱은
      AppText 가 굵기 클래스로 Pretendard 파일을 고른다.
    </p>
  </div>
);

const meta = { title: '기초/글자', parameters: { layout: 'fullscreen' } } satisfies Meta;
export default meta;
export const SizeAndWeight: StoryObj = { name: '크기와 굵기', render: () => <Type /> };
