import { expect, userEvent, within } from 'storybook/test';

import ApiErrorBoundary from './ApiErrorBoundary';

import type { Meta, StoryObj } from '@storybook/react';

const Broken = (): React.ReactNode => {
  throw new Error('스토리용 일부러 낸 오류');
};

/**
 * 불러오기 실패 — web 은 경계 안이 실패하면 화면 전체 ServerError(그림·「다시 시도」).
 * 앱은 섹션 한 줄 SectionErrorRow(「다시 시도」)라 모양이 다르다 — web 섹션 단위 짝은 아직 없다(섹션을 숨긴다).
 */
const meta = {
  title: 'components/ApiErrorBoundary',
  component: ApiErrorBoundary,
  parameters: { layout: 'fullscreen' },
  args: { children: <Broken /> },
} satisfies Meta<typeof ApiErrorBoundary>;

export default meta;

export const Failed: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('화면을 불러오지 못했어요')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: '다시 시도' }));
  },
};
