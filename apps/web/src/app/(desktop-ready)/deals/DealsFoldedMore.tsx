'use client';

import { text } from '@jirum/design-system/recipes';
import { useState } from 'react';

import { cn } from '@/shared/lib/cn';

import { DealGrid, DealRows, type ListItem } from './DealsListParts';

export type FoldedLink = { slug: string; name: string };

/**
 * 「N개 더 보기」 — 처음 HTML 엔 이름 링크만 싣고, 열 때 카드 데이터를 받아 그린다.
 * 접힌 1,000여 개를 서버에서 사진·추이까지 다 실으면 /deals 가 3.2MB(압축 318KB)였다(2026-10-13).
 * 링크는 닫힌 상태에서도 HTML 에 남아 크롤러가 상세로 따라간다. 받기에 실패하면 링크 목록을 그대로 보여 준다.
 */
export default function DealsFoldedMore({
  links,
  variant,
}: {
  links: FoldedLink[];
  variant: 'grid' | 'rows';
}) {
  const [state, setState] = useState<'closed' | 'loading' | 'failed' | ListItem[]>('closed');

  const load = async () => {
    setState('loading');
    try {
      const res = await fetch('/api/deals/list-items', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slugs: links.map((l) => l.slug) }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const { items } = (await res.json()) as { items: ListItem[] };
      setState(items);
    } catch {
      setState('failed');
    }
  };

  return (
    <details
      className={`group ${variant === 'grid' ? 'mt-4' : 'mt-3'}`}
      onToggle={(e) => {
        if (e.currentTarget.open && state === 'closed') void load();
      }}
    >
      <summary className="cursor-pointer list-none rounded-xl border border-gray-200 py-3 text-center text-sm font-medium text-gray-700 group-open:hidden">
        {links.length}개 더 보기
      </summary>
      {Array.isArray(state) ? (
        variant === 'grid' ? (
          <DealGrid items={state} className="mt-3" />
        ) : (
          <DealRows items={state} className="mt-2" />
        )
      ) : (
        <>
          {state === 'loading' && (
            <p className={cn(text.muted, 'py-6 text-center')}>불러오는 중…</p>
          )}
          <ul
            className={state === 'loading' ? 'hidden' : cn(text.body, 'mt-2 flex flex-col gap-2')}
          >
            {links.map((l) => (
              <li key={l.slug}>
                <a href={`/deals/${l.slug}`} className="hover:underline">
                  {l.name}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </details>
  );
}
