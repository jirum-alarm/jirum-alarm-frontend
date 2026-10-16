import MenuList from './MenuList';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * 설정·메뉴 목록 행 — 작은 회색 묶음 제목 + 아이콘·제목·화살표. 모양은 recipes `listRow`(앱 내정보 Rows 와 같은 값).
 */
const meta = {
  title: 'components/MenuList',
  component: MenuList,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="w-[390px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MenuList>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
