import type { Meta, StoryObj } from '@storybook/react'
import { useToast } from './useToast'
import Button from '../Button'
import RecoilSetting from '@/lib/provider/recoil'

type Options = NonNullable<Parameters<typeof useToast>[0]>

const ToastStoryDisplay = (
  { message, duration }: { message?: string } & Options = { message: '', duration: 1500 },
) => {
  return (
    <RecoilSetting>
      <div className="grid gap-y-4">
        <ToastStory
          options={{ duration }}
          message={message || '저장되었습니다'}
          buttonText="저장"
        />
        <ToastStory
          options={{ duration }}
          message={message || '확인되었습니다'}
          buttonText="확인"
        />
      </div>
    </RecoilSetting>
  )
}

const ToastStory = ({
  options,
  message,
  buttonText,
}: {
  options: Options
  message: string
  buttonText: string
}) => {
  const { showToast, ToastContainer } = useToast(options)

  return (
    <>
      <Button onClick={() => showToast(message)}>{buttonText}</Button>
      <ToastContainer />
    </>
  )
}

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'components/Toast/useToast',
  component: ToastStoryDisplay,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
} satisfies Meta<typeof ToastStoryDisplay>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {
    duration: 1500,
    message: '',
  },
}

export const LongMessage: Story = {
  args: {
    duration: 1500,
    message:
      '변경 하신 내용이 저장되었습니다. 변경 후의 내용을 확인해주세요. 자세한 사항은 아래의 링크를 참조해주세요. ',
  },
}

export const LongDuratiom: Story = {
  args: {
    duration: 5000,
    message: '',
  },
}
