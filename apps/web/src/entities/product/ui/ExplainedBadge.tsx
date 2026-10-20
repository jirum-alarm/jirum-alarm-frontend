'use client';

import { Fragment, type ReactNode } from 'react';

import Tooltip from '@/shared/ui/common/Tooltip';

/**
 * 누르면 뜻을 알려 주는 배지(토스 신뢰 배지·판매종료). 배지는 원래 누를 수 없는 라벨인데, 상세에선 모양이 버튼 같아
 * 눌러 보는 사람이 많았고 아무 일도 없었다(Clarity dead click, 2026-10-20) — 누르면 한두 줄 설명을 띄운다.
 * 문구는 정본 @jirum/domain/badge-explain(앱과 같다). 줄마다 끊어 그린다 — 말풍선은 한 줄로 늘어나 폰 화면 밖으로 밀린다.
 */
export default function ExplainedBadge({
  lines,
  children,
}: {
  lines: readonly string[];
  children: ReactNode;
}) {
  return (
    <Tooltip
      content={
        <p className="text-fixed-white text-13">
          {lines.map((line, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </p>
      }
    >
      <button type="button" className="flex">
        {children}
      </button>
    </Tooltip>
  );
}
