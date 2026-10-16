import { ArrowLeft, Search } from '../common/icons';

import PageHeader from './PageHeader';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * 화면 상단 헤더(56px, 제목 왼쪽). 모양은 recipes `pageHeader` — 앱 StackHeader·탭 헤더(내정보·알림·커뮤니티)가 같은 값.
 * 실제로는 fixed 라 화면 위에 붙는다. 여기선 틀(transform) 안에 가둬 보여 준다.
 * 왼쪽 슬롯엔 실제로 BackButton(같은 폴더)이 들어간다 — 그건 앱 라우터가 있어야 돌아서 여기선 같은 모양의 버튼으로 보인다.
 */
const Back = () => (
  <button type="button" aria-label="뒤로 가기" className="relative -m-2 rounded-full p-2">
    <ArrowLeft width={28} height={28} className="relative -left-2" />
  </button>
);
const meta = {
  title: 'components/PageHeader',
  component: PageHeader,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="relative h-20 w-[390px]" style={{ transform: 'translateZ(0)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Title: Story = { args: { title: '마이페이지' } };

export const WithBack: Story = { args: { leading: <Back />, title: '알림 설정' } };

export const WithActions: Story = {
  args: {
    leading: <Back />,
    title: '검색',
    actions: (
      <button type="button" aria-label="검색">
        <Search />
      </button>
    ),
  },
};
