import React from 'react';

export type StatItem = {
  label: string;
  value: React.ReactNode;
  /** 값 아래 작은 설명 */
  hint?: React.ReactNode;
  tone?: 'danger' | 'success' | 'muted';
};

const TONE = { danger: 'text-danger', success: 'text-success', muted: 'text-bodydark2' } as const;

/** 숫자 타일 묶음 — 폰 2칸, 넓으면 cols 칸 */
const StatTiles = ({ items, cols = 4 }: { items: StatItem[]; cols?: 2 | 3 | 4 }) => (
  <div
    className={`grid grid-cols-2 gap-2 sm:gap-3 ${cols === 3 ? 'md:grid-cols-3' : cols === 4 ? 'md:grid-cols-4' : ''}`}
  >
    {items.map((s) => (
      <div
        key={s.label}
        className="rounded-lg border border-stroke bg-white px-3 py-2.5 dark:border-strokedark dark:bg-boxdark"
      >
        <p className="text-xs text-body">{s.label}</p>
        <p
          className={`mt-0.5 text-lg font-bold ${s.tone ? TONE[s.tone] : 'text-black dark:text-white'}`}
        >
          {s.value}
        </p>
        {s.hint != null && <p className="mt-0.5 text-[11px] text-bodydark2">{s.hint}</p>}
      </div>
    ))}
  </div>
);

export default StatTiles;
