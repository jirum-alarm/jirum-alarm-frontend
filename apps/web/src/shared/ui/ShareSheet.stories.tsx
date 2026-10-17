import { expect, screen, userEvent, within } from 'storybook/test';

import Button from './common/Button';
import Toaster from './common/Toast/Toaster';
import ShareSheet from './ShareSheet';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * 공유 시트 — 미리보기 → 앱 줄(카톡·X·스레드·다른 앱) → 링크 칸(복사 결과는 칸 안 「복사됨」). 겉은 recipes `sheet`(PC 는 가운데 모달).
 * 앱은 screens/detail/ui/ShareSheet(같은 채널 순서). 채널을 누르면 실제 SDK 가 열리므로 여기선 여는 것까지만 본다.
 */
const meta = {
  title: 'components/ShareSheet',
  component: ShareSheet,
  parameters: {
    layout: 'centered',
    // axe 는 조사가 붙은 이름(「스레드로 공유」)의 「스레드로」를 보이는 글자 「스레드」와 다른 단어로 본다 — 한국어 오탐.
    // 보이는 글자가 이름에 없는 진짜 경우(예전 「기타」 → 「다른 앱으로 공유」)는 글자를 「다른 앱」으로 바꿔 고쳤다.
    a11y: { config: { rules: [{ id: 'label-content-name-mismatch', enabled: false }] } },
  },
  args: {
    title: '제주 삼다수 2L 12병',
    description: '9,900원 · 쿠팡',
    children: <Button size="md">공유하기</Button>,
  },
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
} satisfies Meta<typeof ShareSheet>;

export default meta;

export const Open: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: '공유하기' }));
    const dialog = await screen.findByRole('dialog', { name: '공유하기' });
    await expect(within(dialog).getByRole('button', { name: '카카오톡으로 공유' })).toBeVisible();
    await expect(within(dialog).getByRole('button', { name: '링크 복사' })).toBeVisible();
  },
};
