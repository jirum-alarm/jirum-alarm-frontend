import type { Meta, StoryObj } from '@storybook/react'
import { Cancel } from '../icons'
import { Button } from './Button'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'components/Button',
  component: Button,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      defaultValue: false,
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {
    children: <div>다음</div>,
  },
}
export const Filled: Story = {
  args: {
    variant: 'filled',
    disabled: false,
    children: <div>다음</div>,
  },
}
export const Outlined: Story = {
  args: {
    variant: 'outlined',
    disabled: false,
    children: <div>다음</div>,
  },
}
