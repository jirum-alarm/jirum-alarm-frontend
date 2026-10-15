import DetailSectionHeader from './DetailSectionHeader';
import SectionHeader from './SectionHeader';

import type { Meta, StoryObj } from '@storybook/react';

/** 섹션 제목 — page = 홈·목록 섹션(h-14, 굵게, 오른쪽 더보기 자리), detail = 상세 안 섹션(DetailSectionHeader). */
const meta = {
  title: 'components/SectionHeader',
  component: SectionHeader,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = { args: { title: '지금 뜨는 핫딜', shouldShowMobileUI: true } };

export const WithMore: Story = {
  args: {
    title: '오늘의 랭킹',
    shouldShowMobileUI: true,
    right: (
      <a href="#more" className="text-sm text-gray-600">
        더보기
      </a>
    ),
  },
};

export const Detail: Story = {
  args: { title: '' },
  render: () => (
    <div className="flex flex-col gap-8">
      {/* 실제 화면처럼 <section> 안에 둔다 — <header> 가 섹션 밖에 있으면 페이지 머리(banner)로 읽힌다. */}
      <section aria-label="가격 추이">
        <DetailSectionHeader title="가격 추이" subtitle="지난 90일 동안의 핫딜 가격이에요" />
      </section>
      <section aria-label="커뮤니티 반응">
        <DetailSectionHeader
          title="커뮤니티 반응"
          right={
            <a href="#all" className="text-sm text-gray-600">
              전체보기
            </a>
          }
        />
      </section>
    </div>
  ),
};
