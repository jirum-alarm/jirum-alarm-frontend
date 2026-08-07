import type { CommentSummary } from '../model/types';

/**
 * commentSummary — 원 커뮤니티 댓글의 LLM 요약. 이미 생성돼 있는 자산이고
 * 다나와 매핑에 의존하지 않아서, 매핑 병목을 우회하는 유일한 판단 신호다.
 * 단 summary 채움률이 낮으므로(실측 10%) 있을 때만 렌더한다.
 */
export default function CommunityReview({
  summary,
  title,
}: {
  summary: CommentSummary;
  title: string;
}) {
  const facets = [
    { k: '만족도', v: summary.satisfaction },
    { k: '가격 반응', v: summary.price },
    { k: '옵션', v: summary.option },
    { k: '구매 방법', v: summary.purchaseMethod },
  ].filter((f) => f.v);

  return (
    <div className="rounded-2xl border border-gray-200 p-4">
      <p className="mb-2.5 line-clamp-1 text-[11px] text-gray-500">{title}</p>
      <div className="mb-3 flex items-start gap-2.5">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-gray-100">
          <svg
            className="size-3.5 text-gray-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </span>
        <p className="text-[13.5px] leading-relaxed text-gray-700">{summary.summary}</p>
      </div>

      {facets.length > 0 && (
        <dl className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 md:grid-cols-4">
          {facets.map((f) => (
            <div key={f.k} className="rounded-lg bg-gray-50 px-2.5 py-2">
              <dt className="text-[10px] text-gray-500">{f.k}</dt>
              <dd className="line-clamp-2 text-[12px] font-medium text-gray-800">{f.v}</dd>
            </div>
          ))}
        </dl>
      )}

      <p className="mt-2.5 text-[10.5px] text-gray-500">원 커뮤니티 댓글을 요약한 내용이에요</p>
    </div>
  );
}
