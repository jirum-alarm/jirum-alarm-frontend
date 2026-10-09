'use client';

import { useState } from 'react';

export type RankItem = { label: string; value: number; color?: string };

/** 순위 목록 — 이름·값·비례 막대. 폰에서 가로 막대 차트보다 읽기 쉽다 */
const RankList = ({
  items,
  format = (v) => v.toLocaleString(),
  initial = 10,
  color = '#3C50E0',
}: {
  items: RankItem[];
  format?: (v: number) => string;
  initial?: number;
  color?: string;
}) => {
  const [shown, setShown] = useState(initial);
  if (items.length === 0)
    return <p className="py-6 text-center text-sm text-bodydark2">데이터가 없습니다</p>;
  const top = Math.max(...items.map((i) => i.value), 1);
  return (
    <>
      <ol className="space-y-2">
        {items.slice(0, shown).map((item, i) => (
          <li key={`${item.label}-${i}`} className="text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate text-black dark:text-white">
                <span className="mr-1.5 inline-block w-5 text-right text-xs text-bodydark2">
                  {i + 1}
                </span>
                {item.label}
              </span>
              <span className="shrink-0 font-semibold text-black dark:text-white">
                {format(item.value)}
              </span>
            </div>
            <div className="mt-1 ml-6.5 h-1.5 rounded-full bg-gray-2 dark:bg-meta-4">
              <div
                className="h-full rounded-full"
                style={{ width: `${(item.value / top) * 100}%`, background: item.color ?? color }}
              />
            </div>
          </li>
        ))}
      </ol>
      {items.length > shown && (
        <button
          type="button"
          onClick={() => setShown((v) => v + 20)}
          className="mt-3 w-full rounded-lg border border-stroke py-2 text-sm font-medium text-body dark:border-strokedark"
        >
          더 보기 ({items.length - shown}개)
        </button>
      )}
    </>
  );
};

export default RankList;
