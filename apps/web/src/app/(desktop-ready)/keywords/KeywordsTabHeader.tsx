'use client';

import PageHeader from '@/shared/ui/layout/PageHeader';

import SearchLinkButton from '@/features/search/ui/SearchLinkButton';

// 모바일 상단 헤더 — /keywords 는 하단 탭 루트라(2026-10-20) 뒤로가기 없이 제목·검색만.
// 본문에 h1 이 있어 제목은 span 으로 내린다(DealsMobileHeader 와 같은 이유). PC 는 GNB 가 있어 숨긴다.
export default function KeywordsTabHeader() {
  return (
    <PageHeader
      // 본문 main 의 px-5 안에 놓여 fixed 가 20px 밀린다 — 좌우를 0 에 붙이고 가운데로.
      className="pc:hidden inset-x-0 mx-auto"
      title={<span className="truncate text-lg font-semibold text-gray-900">키워드</span>}
      actions={<SearchLinkButton color="var(--color-gray-900)" />}
    />
  );
}
