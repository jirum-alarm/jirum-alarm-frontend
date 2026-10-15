'use client';

import { useState } from 'react';

import { ProductCommentSummary } from '@/shared/api/gql/graphql';
import { AIIcon } from '@/shared/ui/common/icons';
import Etc from '@/shared/ui/common/icons/Etc';
import Option from '@/shared/ui/common/icons/Option';
import Price from '@/shared/ui/common/icons/Price';
import Shop from '@/shared/ui/common/icons/Shop';
import Tip from '@/shared/ui/common/icons/Tip';

const SUMMARY_DATA: {
  id: keyof ProductCommentSummary;
  title: string;
  icon: React.ReactNode;
}[] = [
  { id: 'summary', title: '댓글 반응', icon: <AIIcon /> },
  { id: 'price', title: '핫딜 가격', icon: <Price /> },
  { id: 'satisfaction', title: '만족도', icon: <Shop /> },
  { id: 'option', title: '옵션 및 사이즈', icon: <Option /> },
  { id: 'purchaseMethod', title: '구매 팁', icon: <Tip /> },
  { id: 'additionalInfo', title: '기타', icon: <Etc /> },
];

/** 처음엔 이만큼만 보인다 — 「댓글 반응」 한 줄 요약이 핵심이고 나머지(가격·만족도·옵션…)는 펼쳐 본다. */
const COLLAPSED_ROWS = 2;

/**
 * 댓글 AI 요약 — 커뮤니티 반응 카드 안, 위에 선 하나로 나눈다.
 * 접힌 줄도 HTML 에는 남긴다(hidden) — 검색 색인·AI 인용이 요약 전문을 읽게.
 */
export function Reactions({ commentSummary }: { commentSummary: ProductCommentSummary }) {
  const [expanded, setExpanded] = useState(false);
  // 댓글이 인사뿐이면 서버가 칸을 전부 비운다(2026-10-13) — 빈 칸을 그리지 않는다(앱 Reactions 와 같다).
  const rows = SUMMARY_DATA.filter((item) => commentSummary?.[item.id]);
  if (!rows.length) return null;
  const hiddenCount = expanded ? 0 : Math.max(0, rows.length - COLLAPSED_ROWS);
  return (
    <section aria-label="댓글 AI 요약" className="border-t border-gray-100 pt-3">
      <ul className="space-y-3">
        {rows.map((item, index) => {
          const value = commentSummary[item.id];
          return (
            <li key={item.id} hidden={!expanded && index >= COLLAPSED_ROWS}>
              <div className="flex items-center gap-x-1 pb-1">
                {item.icon}
                <span className="text-sm font-medium text-gray-900">{item.title}</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-600">{value}</p>
            </li>
          );
        })}
      </ul>
      {hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-3 text-sm font-medium text-gray-600 hover:text-gray-800"
        >
          요약 {hiddenCount}개 더 보기
        </button>
      ) : null}
    </section>
  );
}
