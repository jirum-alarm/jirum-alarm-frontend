import type { Meta, StoryObj } from '@storybook/react'
import { Cancel } from '../icons'
import { Input } from './Input'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'components/Input',
  component: Input,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Placeholder: Story = {
  args: {
    placeholder: '닉네임을 입력해주세요.',
  },
}
export const Error: Story = {
  args: {
    error: '올바른 이메일 주소를 입력해주세요',
    helperText: '공백없이 2~12자로 입력해주세요.',
    value: 'useremail |',
  },
}

export const HelperText: Story = {
  args: {
    helperText: '공백없이 2~12자로 입력해주세요.',
  },
}

export const Icon: Story = {
  args: {
    icon: <Cancel />,
  },
}
