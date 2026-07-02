'use client';

import BackButton from '@/shared/ui/layout/BackButton';
import ShareButton from '@/shared/ui/ShareButton';

// 모바일 전용 상단 헤더 (뒤로가기 + 모델명 + 공유).
// (desktop-ready) 레이아웃은 모바일에 상단 GNB를 안 깔고 하단 BottomNav만 두므로,
// 모바일에선 페이지가 자체 헤더를 가져야 함(기존 RecommendPageHeader·MobileSearchLayout 패턴).
// pc:hidden 으로 데스크톱(GNB 있음)에선 숨김.
export default function DealsMobileHeader({ title }: { title: string }) {
  return (
    <header className="max-w-mobile-max pc:hidden fixed top-0 z-40 flex h-14 w-full items-center justify-between gap-2 bg-white px-5">
      <div className="flex min-w-0 grow items-center gap-x-1">
        <BackButton />
        <h2 className="truncate text-lg font-semibold text-black">{title}</h2>
      </div>
      <ShareButton title={title} />
    </header>
  );
}
