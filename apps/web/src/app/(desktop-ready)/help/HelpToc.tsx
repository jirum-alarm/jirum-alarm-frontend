'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/shared/lib/cn';

export type TocItem = { id: string; label: string; children?: { id: string; label: string }[] };

/**
 * PC 왼쪽 목차 — 스크롤을 따라오며 지금 읽는 구역을 표시한다(긴 도움말 문서의 표준 모양: 본문 옆 고정 목차 + 현재 위치).
 * 모바일은 공간이 없어 본문 위 칩으로 대신한다(page.tsx). 링크는 그냥 #앵커라 JS 가 없어도 동작한다.
 */
export default function HelpToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const ids = items.flatMap((it) => [it.id, ...(it.children ?? []).map((c) => c.id)]);
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    // 화면 위쪽 1/3 띠에 들어온 구역 중 가장 아래 것 = 지금 읽는 곳.
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) =>
          e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id),
        );
        const current = ids.filter((id) => visible.has(id)).pop();
        if (current) setActive(current);
      },
      { rootMargin: '-80px 0px -66% 0px' },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  const parentOf = (id?: string) =>
    items.find((it) => it.id === id || it.children?.some((c) => c.id === id))?.id;
  const activeParent = parentOf(active);

  return (
    <nav aria-label="이 페이지에서" className="text-sm">
      <p className="mb-3 text-xs font-semibold text-gray-500">이 페이지에서</p>
      <ul className="space-y-0.5 border-l border-gray-100">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              aria-current={activeParent === it.id ? 'location' : undefined}
              className={cn(
                '-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-gray-500 transition-colors hover:text-gray-900',
                activeParent === it.id && 'border-primary-600 font-semibold text-gray-900',
              )}
            >
              {it.label}
            </a>
            {it.children && activeParent === it.id ? (
              <ul className="mb-1">
                {it.children.map((c) => (
                  <li key={c.id}>
                    <a
                      href={`#${c.id}`}
                      className={cn(
                        'text-13 block py-1 pl-7 text-gray-500 hover:text-gray-900',
                        active === c.id && 'font-medium text-gray-900',
                      )}
                    >
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}
