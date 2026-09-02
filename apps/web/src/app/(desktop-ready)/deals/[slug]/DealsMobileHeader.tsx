'use client';

import BackButton from '@/shared/ui/layout/BackButton';
import PageHeader from '@/shared/ui/layout/PageHeader';
import ShareButton from '@/shared/ui/ShareButton';

// 모바일 전용 상단 헤더 (뒤로가기 + 모델명 + 공유).
// (desktop-ready) 레이아웃은 모바일에 상단 GNB를 안 깔고 하단 BottomNav만 두므로,
// 모바일에선 페이지가 자체 헤더를 가져야 함(기존 RecommendPageHeader·MobileSearchLayout 패턴).
// pc:hidden 으로 데스크톱(GNB 있음)에선 숨김.
// title 을 문자열로 넘기면 PageHeader 가 h1 으로 렌더한다. /deals·/deals/{slug} 는 본문에
// 자체 h1(모델명)이 있어 그러면 페이지에 h1 이 2개가 된다 — 2026-09-02 운영 HTML 실측.
// 문자열이 아닌 노드를 넘기면 PageHeader 가 그대로 렌더하므로, 여기서만 span 으로 내린다
// (공용 PageHeader 와 나머지 사용처 22곳은 건드리지 않는다).
export default function DealsMobileHeader({ title }: { title: string }) {
  return (
    <PageHeader
      className="pc:hidden"
      leading={<BackButton />}
      title={<span className="truncate text-lg font-semibold text-gray-900">{title}</span>}
      actions={<ShareButton title={title} />}
    />
  );
}
