'use client';

import { text } from '@jirum/design-system/recipes';
import { createHangulFilter } from '@jirum/domain/hangul-search';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';

export interface DealsSearchItem {
  slug: string;
  name: string;
  /** "진행 중 9,800원" · "적정가 12,000원 이하" 같은 한 줄. */
  hint: string | null;
}

/**
 * 상품 이름으로 찾기 — 1,200여 개를 훑어 내려가는 대신 사려던 상품의 적정가로 바로 간다.
 * 검색어가 없으면 아무것도 그리지 않아 아래 섹션이 그대로 보인다.
 * 초성("ㅅㄹㅁ" → 신라면)·조합 중인 글자("신라며" → 신라면)도 찾는다 — 예전엔 둘 다 「0개」였다.
 */
export default function DealsSearch({ items }: { items: DealsSearchItem[] }) {
  const [query, setQuery] = useState('');
  const filter = useMemo(() => createHangulFilter(items, (it) => it.name), [items]);
  const q = query.trim();
  const results = useMemo(() => (q ? filter(q) : []), [filter, q]);

  return (
    <div className="mb-10">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="상품 이름·초성으로 찾기 (예: 맛밤, ㅂㄷㅂㅇㅁ)"
        aria-label="상품 이름으로 찾기"
        className="pc:max-w-md w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none"
      />
      {q && (
        <div className="mt-3">
          {results.length > 0 ? (
            <>
              <p className={cn(text.caption, 'mb-2')}>{results.length}개 찾았어요</p>
              <ul className="pc:grid-cols-3 grid grid-cols-1 gap-2">
                {results.slice(0, 30).map((it) => (
                  <li key={it.slug}>
                    <Link
                      href={`/deals/${it.slug}`}
                      className="flex flex-col rounded-lg border border-gray-100 px-3 py-2.5 hover:bg-gray-50"
                    >
                      <span className="line-clamp-1 text-sm font-medium text-gray-900">
                        {it.name}
                      </span>
                      {it.hint && <span className={text.caption}>{it.hint}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className={text.muted}>
              아직 가격을 모으는 상품이 아니에요.{' '}
              <Link
                href={PAGE.MYPAGE_KEYWORD}
                rel="nofollow"
                className="text-primary-800 font-semibold"
              >
                키워드 알림
              </Link>
              을 걸어 두면 핫딜이 뜰 때 알려드려요.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
