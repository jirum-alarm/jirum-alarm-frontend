import { AlarmIllustError, IllustWarning } from '@/shared/ui/common/icons';

import SmallIllust from './SmallIllust';

import { ErrorIllust, Illust, StandingIllust } from '.';

import type { Meta, StoryObj } from '@storybook/react';

// 화면에 실제로 나오는 마스코트 — 다크(툴바 「테마」)에서 윤곽선이 바탕에 묻히지 않는지 본다.
const items = [
  { name: 'Illust', where: '가입 완료·알림 빈 상태', node: <Illust /> },
  { name: 'SmallIllust', where: '찜 빈 상태', node: <SmallIllust /> },
  { name: 'StandingIllust', where: '로그인', node: <StandingIllust /> },
  { name: 'ErrorIllust', where: '검색 결과 없음', node: <ErrorIllust /> },
  { name: 'IllustWarning', where: '404·서버 오류', node: <IllustWarning /> },
  { name: 'AlarmIllustError', where: '알림 없음', node: <AlarmIllustError /> },
];

const Gallery = () => (
  <div className="grid grid-cols-2 gap-6 p-4">
    {items.map(({ name, where, node }) => (
      <div key={name} className="flex flex-col items-center gap-2">
        {node}
        <p className="text-xs text-gray-500">
          {name} · {where}
        </p>
      </div>
    ))}
  </div>
);

const meta = {
  title: 'components/Illustrations',
  component: Gallery,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof Gallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {};
