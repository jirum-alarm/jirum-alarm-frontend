import type { Meta, StoryObj } from '@storybook/react';
import AlertDialog from '.';
import Button from '../Button';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'components/AlertDialog',
  component: AlertDialog,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof AlertDialog>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  render: () => {
    return (
      <AlertDialog>
        <AlertDialog.Trigger asChild>
          <button className="text-white">열기</button>
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
                지름알림에서 <span className="font-semibold">로그아웃</span>할까요?
              </p>
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel asChild>
              <Button color="error">취소</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild onClick={() => console.log('액션')}>
              <Button color="secondary" onClick={() => console.log('확인')}>
                확인
              </Button>
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    );
  },
};
