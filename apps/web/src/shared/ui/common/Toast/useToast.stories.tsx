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
