import Button from '../Button';

import Toaster from './Toaster';
import { useToast } from './useToast';

import type { Meta, StoryObj } from '@storybook/react';

const ToastStoryDisplay = ({ message }: { message?: React.ReactNode } = { message: '' }) => {
  return (
    <div className="grid gap-y-4">
      <ToastStory message={message || '개인정보가 저장됐어요.'} buttonText="저장" />
      <ToastStory message={message || '확인되었습니다.'} buttonText="확인" />
      <Toaster />
    </div>
  );
};

const ToastStory = ({ message, buttonText }: { message: React.ReactNode; buttonText: string }) => {
  const { toast } = useToast();

  return <Button onClick={() => toast(message)}>{buttonText}</Button>;
};

// 종류마다 모양이 다르다 — 성공(체크·동작 버튼, 4초)·실패(느낌표)·안내(아이콘 없음).
const ToastTypesDisplay = () => {
  const { toast } = useToast();

  return (
    <div className="grid gap-y-4">
      <Button
        onClick={() =>
          toast.success('키워드를 등록했어요.', { action: { label: '보기', onClick: () => {} } })
        }
      >
        성공
      </Button>
      <Button onClick={() => toast.error('등록하지 못했어요. 잠시 후 다시 시도해 주세요.')}>
        실패
      </Button>
      <Button onClick={() => toast('로그인하면 알림을 받을 수 있어요.')}>안내</Button>
      <Toaster />
    </div>
  );
};

const meta = {
  title: 'components/Toast/useToast',
  component: ToastStoryDisplay,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ToastStoryDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: '',
  },
};

export const LongMessage: Story = {
  args: {
    message: (
      <>
        인터넷이 연결되어 있지 않아요.
        <br />
        잠시 후 다시 시도해주세요.
      </>
    ),
  },
};

export const Types: Story = {
  render: () => <ToastTypesDisplay />,
};
