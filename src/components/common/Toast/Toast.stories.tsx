import type { Meta, StoryObj } from '@storybook/react'
import { useToast } from './useToast'
import { useId } from 'react'
import Button from '../Button'
import RecoilSetting from '@/lib/provider/recoil'

const Toast = ({ message, buttonText }: { message: string; buttonText: string }) => {
  return (
    <RecoilSetting>
      <_Toast message={message} buttonText={buttonText} />
    </RecoilSetting>
  )
}

const _Toast = ({ message, buttonText }: { message: string; buttonText: string }) => {
  const { showToast, ToastContainer } = useToast(useId())

  return (
    <>
      <Button onClick={() => showToast(message)}>{buttonText}</Button>
      <ToastContainer />
    </>
  )
}

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'components/Toast',
  component: Toast,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {
    message: '저장이 완료되었습니다',
    buttonText: '저장',
  },
}
