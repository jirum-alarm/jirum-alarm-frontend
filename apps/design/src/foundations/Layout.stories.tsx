import Badge from '@/shared/ui/common/Badge';
import Button from '@/shared/ui/common/Button';
import Chip from '@/shared/ui/common/Chip';
import SectionHeader from '@/shared/ui/SectionHeader';
import { layout } from '@jirum/design-system/layout';
import { cardThumb, emptyText } from '@jirum/design-system/recipes';
import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

/** 간격을 눈으로 보이게 — 사이 공간에 옅은 파랑을 깐다. */
const Gap = ({ cls, label }: { cls: string; label: string }) => (
  <div className="flex items-center gap-4">
    <code className="w-48 shrink-0 text-xs text-gray-700">{label}</code>
    <div className={`bg-secondary-100 flex ${cls}`}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-8 w-12 rounded-sm bg-gray-300" />
      ))}
    </div>
  </div>
);

const RulesView = () => (
  <div className="max-w-3xl">
    <h1 className="mb-1 text-2xl font-bold">조립 규칙 — 간격 · 크기</h1>
    <p className="mb-6 text-sm text-gray-600">
      부품끼리 얼마나 떨어지고 얼마나 큰가. 숫자를 새로 고르지 말고{' '}
      <code>@jirum/design-system/layout</code> 의 이름을 쓴다. 값은 2026-10 web·앱 화면의 다수 값을
      실측해 고정했다.
    </p>

    <h2 className="mb-3 text-lg font-bold">간격</h2>
    <div className="flex flex-col gap-3">
      <Gap cls={layout.stack.tight} label={`stack.tight · ${layout.stack.tight}`} />
      <Gap cls={layout.stack.base} label={`stack.base · ${layout.stack.base}`} />
      <Gap cls={layout.stack.loose} label={`stack.loose · ${layout.stack.loose}`} />
      <Gap cls={layout.inline.chip} label={`inline.chip · ${layout.inline.chip}`} />
    </div>
    <ul className="mt-3 list-disc pl-5 text-sm text-gray-700">
      <li>화면 좌우 여백 gutter = {layout.gutter}(20px)</li>
      <li>섹션 제목 줄 = {layout.sectionHeader}(56px)</li>
      <li>
        섹션 사이 = {layout.sectionGap}(32px), 제목 줄 없는 섹션 위아래 = {layout.sectionPadding}
        (24px)
      </li>
    </ul>

    <h2 className="mt-8 mb-3 text-lg font-bold">조작 요소 높이</h2>
    <div className="flex items-end gap-3">
      {(Object.entries(layout.control) as [string, string][]).map(([name, cls]) => (
        <div key={name} className="text-center">
          <div className={`${cls} w-20 rounded-lg bg-gray-200`} />
          <code className="mt-1 block text-xs">{name}</code>
          <span className="text-xs text-gray-600">{cls}</span>
        </div>
      ))}
    </div>
    <p className="mt-2 text-xs text-gray-600">
      손가락으로 누르는 것은 최소 {layout.minTouch}px. 아이콘이 작으면 겉 영역(패딩·hitSlop)으로
      채운다.
    </p>

    <h2 className="mt-8 mb-3 text-lg font-bold">아이콘 크기</h2>
    <div className="flex items-end gap-6">
      {(Object.entries(layout.icon) as [string, number][]).map(([name, px]) => (
        <div key={name} className="text-center">
          <div className="bg-secondary-500 mx-auto rounded-sm" style={{ width: px, height: px }} />
          <code className="mt-1 block text-xs">{name}</code>
          <span className="text-xs text-gray-600">{px}px</span>
        </div>
      ))}
    </div>
    <p className="mt-2 text-xs text-gray-600">
      nav = 헤더·하단 탭 · action = 줄 끝 동작 · row = 목록 행·버튼 안 · inline = 글자 옆
    </p>
  </div>
);

const DEALS = [
  { title: '삼다수 2L 12병', price: '9,900원', rate: '31%' },
  { title: '에어팟 프로 2', price: '259,000원', rate: '18%' },
  { title: '햇반 210g 36개', price: '29,800원', rate: '22%' },
];

/**
 * 조립 예시 — 이 화면엔 새로 고른 숫자·색이 없다. 전부 카탈로그 부품 + 조립 규칙 이름이다.
 * 새 화면도 이렇게: 부품 지도에서 조각을 고르고, 사이는 layout 이름으로.
 */
const ExampleScreen = () => {
  const [picked, setPicked] = useState(0);
  return (
    <div className="mx-auto w-full max-w-sm rounded-xl border border-gray-200 bg-white">
      <div className={`flex flex-col ${layout.sectionGap} pb-6`}>
        <section className={layout.gutter}>
          <SectionHeader
            title="지금 뜨는 핫딜"
            shouldShowMobileUI
            right={<span className="text-sm text-gray-600">더보기</span>}
          />
          <div className={`flex ${layout.inline.chip}`}>
            {['전체', '식품', '전자'].map((c, i) => (
              <Chip key={c} size="sm" selected={i === picked} onClick={() => setPicked(i)}>
                {c}
              </Chip>
            ))}
          </div>
          <ul className={`mt-4 flex flex-col ${layout.stack.loose}`}>
            {DEALS.map((d) => (
              <li key={d.title} className={`flex ${layout.stack.loose}`}>
                <div className={`${cardThumb} size-16 shrink-0`} />
                <div className={`flex min-w-0 flex-col items-start ${layout.stack.tight}`}>
                  <span className="truncate text-sm text-gray-900">{d.title}</span>
                  <span className="text-base font-bold">
                    <span className="text-error-600 mr-1">{d.rate}</span>
                    {d.price}
                  </span>
                  <Badge tone="success">지금 사도 좋아요</Badge>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className={layout.gutter}>
          <SectionHeader title="내 키워드 알림" shouldShowMobileUI />
          <p className={emptyText}>아직 등록한 키워드가 없어요.</p>
          <div className="mt-4">
            <Button size="lg">키워드 등록하기</Button>
          </div>
        </section>
      </div>
    </div>
  );
};

const meta = { title: '조립 규칙/간격·크기', parameters: { layout: 'fullscreen' } } satisfies Meta;
export default meta;

export const Rules: StoryObj = { name: '규칙', render: () => <RulesView /> };
/** 부품 지도의 조각 + 조립 규칙만으로 만든 화면. */
export const Assembly: StoryObj = { name: '조립 예시', render: () => <ExampleScreen /> };
