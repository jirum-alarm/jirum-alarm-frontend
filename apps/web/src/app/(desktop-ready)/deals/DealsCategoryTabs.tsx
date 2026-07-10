'use client';

import { Tabs } from 'radix-ui';

import TabBarV2 from '@/widgets/trending/ui/TabbarV2';

type Props = {
  /** 전체 카테고리(랭킹과 동일 노출). id=categoryId. */
  categories: { id: number; name: string }[];
  /** published 없는 카테고리 id — 비활성. */
  disabledIds: number[];
};

/**
 * /deals 카테고리 탭 — 랭킹 TabbarV2를 그대로 재사용(스타일/동작 동일).
 * 단 콘텐츠 전환이 아니라 클릭 시 해당 카테고리 섹션(#cat-{id})으로 앵커 스크롤.
 * value는 radix Tabs 요구사항 충족용 더미(고정 'nav') — 실제 선택 상태는 안 씀.
 */
export default function DealsCategoryTabs({ categories, disabledIds }: Props) {
  const scrollToCategory = (id: number) => {
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Tabs.Root value="nav">
      <TabBarV2
        allCategories={categories}
        tabIndex={-1} // 활성 탭 없음 — 앵커 네비라 선택 상태 개념 없음
        onTabClick={scrollToCategory}
        disabledIds={disabledIds}
      />
    </Tabs.Root>
  );
}
