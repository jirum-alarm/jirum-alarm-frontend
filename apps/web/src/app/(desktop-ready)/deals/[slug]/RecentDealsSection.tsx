import { dealRow } from '@jirum/design-system/recipes';

import { cn } from '@/shared/lib/cn';
import { convertToWebp } from '@/shared/lib/utils/image';
import Badge from '@/shared/ui/common/Badge';
import ImageComponent from '@/shared/ui/ImageComponent';

import { RecentDealRow, relativeTimeLabel } from '@/features/deals/lib/model-page-insights';

/**
 * 상세 "최근 올라온 핫딜" — 날짜순. 아래 "핫딜 목록"은 싼 순이라 2024년 딜이 맨 위에 와서
 * 이 상품에 요즘 무슨 딜이 떴는지 안 보였다(2026-10-13). 매칭은 됐지만 검수 전인 딜은 배지로 구분한다.
 */
export default function RecentDealsSection({ rows }: { rows: RecentDealRow[] }) {
  if (rows.length === 0) return null;
  const hasPending = rows.some((r) => r.source === 'pending');
  return (
    <section className="mb-6">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold">최근 올라온 핫딜</h2>
        <span className="text-xs text-gray-500">새로 올라온 순</span>
      </div>
      <ul className="pc:grid-cols-2 grid grid-cols-1 gap-2">
        {rows.map((r) => (
          <li key={r.productId}>
            <a href={`/products/${r.productId}`} className={cn('flex items-center gap-3', dealRow)}>
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-gray-50">
                {r.thumbnail && (
                  <ImageComponent
                    src={convertToWebp(r.thumbnail) ?? r.thumbnail}
                    fallbackSrc={r.thumbnail}
                    alt={r.title}
                    width={48}
                    height={48}
                    className="h-full w-full object-contain"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="line-clamp-1 text-sm">{r.title}</div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                  {r.isEnd ? (
                    <Badge size="xs">지난 딜</Badge>
                  ) : (
                    <Badge size="xs" tone="success">
                      진행 중
                    </Badge>
                  )}
                  {r.source === 'pending' && (
                    <Badge size="xs" tone="secondary">
                      확인 전
                    </Badge>
                  )}
                  <span>{relativeTimeLabel(r.postedAt)}</span>
                  {r.mallName && <span className="truncate">{r.mallName}</span>}
                </div>
              </div>
              {r.priceText && (
                <span
                  className={cn(
                    'shrink-0 text-sm font-semibold',
                    r.isEnd ? 'text-gray-500' : 'text-gray-900',
                  )}
                >
                  {r.priceText}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
      {hasPending && (
        <p className="mt-2 text-xs text-gray-500">
          ‘확인 전’은 같은 상품으로 자동 연결됐지만 아직 사람이 확인하지 않은 딜이라, 가격 추이에는
          넣지 않아요.
        </p>
      )}
    </section>
  );
}
