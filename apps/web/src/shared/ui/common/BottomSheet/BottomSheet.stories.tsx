import { Drawer } from 'vaul';

import { BottomSheetContent } from './BottomSheet';

import type { Meta, StoryObj } from '@storybook/react';

// 시트는 화면을 덮는 fixed 판이라 docs 한 페이지에 여럿 그리면 서로 가린다 — 캔버스에서 열린 채로 본다.
const meta = {
  title: 'components/BottomSheet',
  component: BottomSheetContent,
  parameters: { layout: 'fullscreen' },
  tags: ['!autodocs'],
} satisfies Meta<typeof BottomSheetContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithHandle: Story = {
  args: { handle: true, srTitle: '공유하기', className: 'px-5 pb-8' },
  render: (args) => (
    <Drawer.Root open>
      <BottomSheetContent {...args}>
        <ul className="grid gap-y-5 text-base text-gray-900">
          <li>카카오톡으로 공유</li>
          <li>링크 복사</li>
          <li>다른 앱으로 공유</li>
        </ul>
      </BottomSheetContent>
    </Drawer.Root>
  ),
};

export const WithTitle: Story = {
  args: { className: 'px-5 pt-6 pb-8' },
  render: (args) => (
    <Drawer.Root open>
      <BottomSheetContent {...args}>
        <Drawer.Title className="mb-4 text-lg font-semibold text-gray-900">정렬</Drawer.Title>
        <ul className="grid gap-y-4 text-base text-gray-700">
          <li className="font-semibold text-gray-900">최신순</li>
          <li>낮은 가격순</li>
          <li>인기순</li>
        </ul>
      </BottomSheetContent>
    </Drawer.Root>
  ),
};
