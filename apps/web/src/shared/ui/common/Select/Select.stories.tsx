import { expect, userEvent, within } from 'storybook/test';

import Select from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Select> = {
  title: 'components/Select',
  component: Select,
};

export default meta;
type Story = StoryObj<typeof Select>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Placeholder: Story = {
  render: () => {
    return (
      <Select placeholder="출생년도">
        <Select.Option>2000</Select.Option>
        <Select.Option>1999</Select.Option>
        <Select.Option>1998</Select.Option>
        <Select.Option>1997</Select.Option>
        <Select.Option>1996</Select.Option>
        <Select.Option>1995</Select.Option>
        <Select.Option>1994</Select.Option>
        <Select.Option>1993</Select.Option>
        <Select.Option>1992</Select.Option>
        <Select.Option>1991</Select.Option>
        <Select.Option>1990</Select.Option>
      </Select>
    );
  },
};

/** 열고 옵션을 고르면 닫히고, 버튼의 이름이 「출생년도 1998」로 바뀐다. */
export const Choose: Story = {
  render: () => (
    <Select placeholder="출생년도">
      <Select.Option value="2000">2000</Select.Option>
      <Select.Option value="1999">1999</Select.Option>
      <Select.Option value="1998">1998</Select.Option>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const combo = canvas.getByRole('combobox', { name: '출생년도' });
    await userEvent.click(combo);
    await expect(combo).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(canvas.getByRole('option', { name: '1998' }));
    await expect(combo).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.getByRole('combobox', { name: '출생년도 1998' })).toBeVisible();
  },
};

export const DefaultValue: Story = {
  render: () => {
    return (
      <Select placeholder="출생년도" defaultValue="1">
        <Select.Option value={'1'}>2000</Select.Option>
        <Select.Option value={'2'}>1999</Select.Option>
        <Select.Option value={'3'}>1998</Select.Option>
        <Select.Option value={'4'}>1997</Select.Option>
        <Select.Option value={'5'}>1996</Select.Option>
        <Select.Option value={'6'}>1995</Select.Option>
        <Select.Option value={'7'}>1994</Select.Option>
        <Select.Option value={'8'}>1993</Select.Option>
        <Select.Option value={'9'}>1992</Select.Option>
        <Select.Option value={'10'}>1991</Select.Option>
        <Select.Option value={'11'}>1990</Select.Option>
      </Select>
    );
  },
};

export const ChangeEvent: Story = {
  render: () => {
    return (
      <Select placeholder="출생년도" defaultValue="4" onChange={(value) => console.log(value)}>
        <Select.Option value={'1'}>2000</Select.Option>
        <Select.Option value={'2'}>1999</Select.Option>
        <Select.Option value={'3'}>1998</Select.Option>
        <Select.Option value={'4'}>1997</Select.Option>
        <Select.Option value={'5'}>1996</Select.Option>
        <Select.Option value={'6'}>1995</Select.Option>
        <Select.Option value={'7'}>1994</Select.Option>
        <Select.Option value={'8'}>1993</Select.Option>
        <Select.Option value={'9'}>1992</Select.Option>
        <Select.Option value={'10'}>1991</Select.Option>
        <Select.Option value={'11'}>1990</Select.Option>
      </Select>
    );
  },
};
