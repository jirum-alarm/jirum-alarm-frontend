import { expect, screen, userEvent, within } from 'storybook/test';
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

/** 닫힌 채 시작해 버튼으로 연다 — 열리면 제목이 붙은 대화상자로 보인다. */
export const OpenFromTrigger: Story = {
  args: { handle: true, srTitle: '공유하기', className: 'px-5 pb-8' },
  render: (args) => (
    <div className="p-5">
      <Drawer.Root>
        <Drawer.Trigger className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-900">
          공유하기
        </Drawer.Trigger>
        <BottomSheetContent {...args}>
          <p className="text-base text-gray-900">카카오톡으로 공유</p>
        </BottomSheetContent>
      </Drawer.Root>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: '공유하기' }));
    // 시트는 포털(body)에 그려진다 — 캔버스가 아니라 screen 에서 찾는다.
    const dialog = await screen.findByRole('dialog', { name: '공유하기' });
    await expect(within(dialog).getByText('카카오톡으로 공유')).toBeVisible();
  },
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
