import { expect, fn, screen, userEvent, within } from 'storybook/test';

import Button from '../Button';

import AlertDialog from '.';

import type { Meta, StoryObj } from '@storybook/react';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'components/AlertDialog',
  component: AlertDialog,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '150vh' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof AlertDialog>;

const onLogout = fn();

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  render: () => {
    return (
      <AlertDialog>
        <AlertDialog.Trigger asChild>
          <button type="button">열기</button>
        </AlertDialog.Trigger>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title className="pt-3 font-semibold text-gray-900">
              로그아웃
            </AlertDialog.Title>
            <AlertDialog.Description>
              <p className="text-gray-700">
                로그아웃 시 알림을 받을 수 없어요.
                <br />
                지름알림에서 <span className="font-semibold">로그아웃</span>
                할까요?
              </p>
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel asChild onClick={() => console.log('취소')}>
              <Button color="secondary">취소</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button color="error" onClick={onLogout}>
                로그아웃
              </Button>
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    );
  },
  // 열면 대화상자가 뜨고, 확인을 누르면 동작이 한 번 불리고 닫힌다.
  play: async ({ canvasElement }) => {
    onLogout.mockClear();
    await userEvent.click(within(canvasElement).getByRole('button', { name: '열기' }));
    const dialog = await screen.findByRole('alertdialog', { name: '로그아웃' });
    await expect(dialog).toHaveAccessibleDescription(/알림을 받을 수 없어요/);
    await userEvent.click(within(dialog).getByRole('button', { name: '로그아웃' }));
    await expect(onLogout).toHaveBeenCalledTimes(1);
  },
};
