import { chip as chipRecipe, linkChip } from '@jirum/design-system/recipes';
import { type HubModelChip } from '@jirum/domain/hub-model-pages';
import Link from 'next/link';

import { cn } from '@/shared/lib/cn';

/**
 * 「상품별 최저가 모음」 칩 줄 — 키워드 허브와 모델 페이지 위 「같은 줄」이 같은 칩을 쓴다(허브에서 누른 칩이 다음 화면에도
 * 같은 모양으로 있어야 어디서 왔는지 이어진다). currentSlug 칩은 지금 보는 상품이라 링크 대신 고른 칩 모양.
 */
export default function HubModelChipList({
  chips,
  source,
  currentSlug,
}: {
  chips: HubModelChip[];
  source: 'keyword_hub' | 'model_page_line';
  currentSlug?: string;
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {chips.map((chip) => {
        // 묶음 안 칩은 줄 이름을 뺀 말만 보이지만, 링크 글은 「진라면 매운맛」으로 읽혀야 한다(검색·스크린리더).
        const name = (
          <>
            {chip.prefix ? <span className="sr-only">{chip.prefix} </span> : null}
            {chip.label}
          </>
        );
        return (
          <li key={chip.slug}>
            {chip.slug === currentSlug ? (
              <span
                aria-current="page"
                className={cn(
                  'inline-block',
                  chipRecipe.size.sm.box,
                  chipRecipe.size.sm.text,
                  chipRecipe.selected.box,
                  chipRecipe.selected.text,
                )}
              >
                {name}
              </span>
            ) : (
              <Link
                href={`/deals/${chip.slug}`}
                data-track="model-page-cta"
                data-source={source}
                className={cn('inline-block', linkChip)}
              >
                {name}
                {chip.good ? (
                  <span className="text-success-700 font-semibold"> · {chip.good}</span>
                ) : null}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
