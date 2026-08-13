import React from 'react';

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;

/**
 * 다나와 공식 최저가. 서버가 대표 상품을 확신할 때만 온다.
 * 없으면 이 자리를 비운다 — 추측 시세를 채우지 않는다.
 */
export function DanawaFloor({ props }: { props: { title: string; price: number } }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
      <div className="mb-1 flex items-center gap-1.5">
        <span className="inline-flex items-center rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold tracking-tight text-white">
          다나와
        </span>
        <span className="text-[12px] font-semibold text-slate-600">공식 최저가</span>
      </div>
      <p className="line-clamp-2 text-[13px] leading-snug text-slate-800">{props.title}</p>
      <p className="mt-1.5 text-[22px] font-extrabold tracking-tight text-slate-900 tabular-nums">
        {won(props.price)}
      </p>
    </div>
  );
}
