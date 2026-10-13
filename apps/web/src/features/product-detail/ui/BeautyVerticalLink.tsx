'use client';

import { cn } from '@/shared/lib/cn';
import { ArrowRight } from '@/shared/ui/common/icons';

/**
 * 화장품 상세 → 지름알림 뷰티(/beauty) 링크. 실험 beauty_detail_room_v1 b 군에만 보인다(SoftKakaoOpenChatPrompt).
 *
 * next/link 대신 맨 <a> — /beauty 는 곧 별도 앱이 같은 주소를 받는다. 클라이언트 이동이면 이 웹 앱이
 * /beauty 를 그리려 들고, 문서 이동이면 어느 쪽이 받든 맞다.
 * 계측: beauty_vertical_click(placement=detail, exp, product_id).
 */
export default function BeautyVerticalLink({
  exp,
  productId,
  className,
}: {
  exp: string;
  productId?: number;
  className?: string;
}) {
  return (
    <a
      href="/beauty"
      onClick={() => {
        (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
          event: 'beauty_vertical_click',
          placement: 'detail',
          exp,
          ...(productId ? { product_id: String(productId) } : {}),
        });
      }}
      className={cn(
        'flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 transition-colors hover:bg-gray-50',
        className,
      )}
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-gray-800">지름알림 뷰티에서 더 보기</span>
        <span className="mt-0.5 block truncate text-xs text-gray-500">
          지금 뜨는 화장품·스킨케어 핫딜 모음
        </span>
      </span>
      <ArrowRight width={18} height={18} aria-hidden className="shrink-0" />
    </a>
  );
}
