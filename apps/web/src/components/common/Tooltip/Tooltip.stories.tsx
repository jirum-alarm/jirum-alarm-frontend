import type { Meta, StoryObj } from '@storybook/react';

import Tooltip from '.';
import { Info } from '../icons';

const meta: Meta<typeof Tooltip> = {
  title: 'components/Tooltip',
  component: Tooltip,
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  render: () => {
    return (
      <div className="h-[800px] p-10">
        <Tooltip
          content={
            <p className="text-s text-white">
              <strong>다나와 최저가</strong>와 <strong>역대 최저가</strong>를 비교하여
              <br /> 현재 핫딜 정도를 계산해 볼 수 있어요
            </p>
          }
        >
          <button>
            <Info />
          </button>
        </Tooltip>
      </div>
    );
  },
};
