import type { Meta, StoryObj } from '@storybook/react';
import { useToast } from './useToast';
import Button from '../Button';
import Toaster from './Toaster';

const ToastStoryDisplay = ({ message }: { message?: string } = { message: '' }) => {
  return (
    <div className="grid gap-y-4">
      <ToastStory message={message || '저장되었습니다'} buttonText="저장" />
      <ToastStory message={message || '확인되었습니다'} buttonText="확인" />
      <Toaster />
    </div>
  );
};

const ToastStory = ({ message, buttonText }: { message: string; buttonText: string }) => {
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
    message:
      '변경 하신 내용이 저장되었습니다. 변경 후의 내용을 확인해주세요. 자세한 사항은 아래의 링크를 참조해주세요. ',
  },
};
