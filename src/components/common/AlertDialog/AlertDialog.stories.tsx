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
          <button>열기</button>
        </AlertDialog.Trigger>
        <AlertDialog.Content>content</AlertDialog.Content>
      </AlertDialog>
    );
  },
};
