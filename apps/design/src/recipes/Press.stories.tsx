import { press } from '@jirum/design-system/recipes';
import { motion } from 'motion/react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

/** 눌림 두 가지 — 면이 있으면 줄어들고(scale), 면이 없으면 흐려진다(dim). 진동 규칙은 표로. */
const PressDemo = () => (
  <div className="flex flex-col gap-6">
    <div className="flex items-center gap-4">
      <motion.button
        type="button"
        whileTap={{ scale: press.scale }}
        className="rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white"
      >
        면이 있는 버튼 — 눌러 보세요
      </motion.button>
      <button
        type="button"
        aria-label="아이콘 버튼"
        className="flex size-11 items-center justify-center rounded-full text-gray-700 active:opacity-50"
      >
        ★
      </button>
    </div>
    <table className="text-sm text-gray-700">
      <tbody>
        {Object.entries(press.haptic).map(([when, style]) => (
          <tr key={when}>
            <td className="pr-4 font-medium text-gray-900">{when}</td>
            <td>{style}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const meta = {
  title: '레시피/눌림',
  component: PressDemo,
  parameters: {
    docs: {
      description: {
        component: `면이 있는 것은 ${press.scale} 로 줄어들고(web whileTap·앱 PressableScale), 면이 없는 아이콘·글자 링크는 ${press.dim} 로 흐려진다(web active:opacity-50·앱 PressableOpacity). 진동은 한 동작에 한 번 — 토스트가 울리는 자리엔 더 넣지 않는다.`,
      },
    },
  },
} satisfies Meta<typeof PressDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
