import { cn } from '@/shared/lib/cn';
import TalkDark from '@/shared/ui/common/icons/TalkDark';
import Link from '@/shared/ui/Link';

/**
 * 상세페이지용 핫딜 카톡방 입장 안내.
 *
 * 주 유입 경로가 핫딜 단톡방인데 상세(모바일)에는 방으로 돌아가는 문이 없었다.
 * 홈의 KakaoOpenChatLink(bg-gray-800 배너)를 그대로 쓰면 상세에서 가장 진한
 * 요소가 되어 구매 CTA와 경합한다 — 상세 면 42개가 전부 #F9FAFB 계열이라
 * 진한 블록 하나가 페이지 위계를 뒤집는다.
 *
 * 그래서 같은 페이지의 PostPurchaseKeywordPrompt 와 같은 어투를 쓴다:
 * 연한 회색 면 + 작은 아이콘 + 한 줄 안내 + 작은 액션. 구매 CTA가 계속
 * 페이지에서 가장 강한 요소로 남는다.
 */
export default function KakaoOpenChatPrompt({
  href,
  className,
}: {
  href: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      className={cn(
        'flex items-center gap-x-3 rounded-lg bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100',
        className,
      )}
    >
      {/* size-5 는 PostPurchaseKeywordPrompt 의 아이콘 자리와 같은 치수다.
          둘은 같은 패턴(연한 회색 면 + 아이콘 + 2줄 + 작은 액션)이라
          아이콘만 1.8배 크면 같은 계층으로 안 읽힌다. */}
      <span aria-hidden className="flex size-5 shrink-0 items-center justify-center">
        <TalkDark width={20} height={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-gray-800">핫딜 카톡방에서 먼저 받기</span>
        <span className="mt-0.5 block truncate text-xs text-gray-500">
          새 특가가 뜨면 카톡으로 알려드려요
        </span>
      </span>
      {/* 이 줄이 클릭 가능하다는 유일한 신호라 gray-400(2.46:1)으로는 안 된다.
          gray-500 이면 4.76:1 로 WCAG AA(4.5:1)를 넘긴다. */}
      <span aria-hidden className="shrink-0 text-xs font-semibold text-gray-500">
        입장
      </span>
    </Link>
  );
}
