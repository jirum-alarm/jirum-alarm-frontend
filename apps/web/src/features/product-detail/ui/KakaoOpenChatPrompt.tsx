import { cn } from '@/shared/lib/cn';
import TalkLight from '@/shared/ui/common/icons/TalkLight';
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
  onNavigate,
}: {
  href: string;
  className?: string;
  /** soft/구매후 공통 — 입장 클릭 시 joined 플래그·계측용 */
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      onClick={onNavigate}
      className={cn(
        // ponytail: 면 색은 그대로 두고 테두리+채운 버튼으로만 눈에 띄게 한다.
        // 진한 면으로 올리면 상세에서 가장 강한 요소가 되어 구매 CTA와 경합한다.
        'border-secondary-200 bg-secondary-50 hover:bg-secondary-100 flex items-center gap-x-3 rounded-lg border px-4 py-3 transition-colors',
        className,
      )}
    >
      {/* 카톡 마크는 노란 원 위의 말풍선으로 읽힌다 — 푸터(Footer.tsx)와 같은 조합.
          TalkDark 를 그냥 얹으면 노란 말풍선이 연한 파란 면에 묻히고,
          20px 에서는 안에 든 'TALK' 글자가 뭉개져 노이즈가 된다. */}
      <span
        aria-hidden
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#FAE300]"
      >
        <TalkLight width={18} height={18} className="mt-0.5" />
      </span>
      <span className="min-w-0 flex-1">
        {/* "핫딜 Only"는 UTM 캠페인명(hotdeal_only)·봇 설정값이 새어 나온 내부 용어라
            유저에겐 정체불명 고유명사로 읽힌다. 방 성격은 아래 줄이 이미 말한다. */}
        <span className="block text-sm font-semibold text-gray-800">핫딜 오픈 채팅방 입장하기</span>
        <span className="mt-0.5 block truncate text-xs text-gray-500">
          지름알림이 엄선한 핫딜만 골라 받아보세요!
        </span>
      </span>
      {/* 이 줄이 클릭 가능하다는 유일한 신호였는데 평문이라 그냥 라벨로 읽혔다.
          다만 카드 전체가 이미 링크라 알약이 "카드 안의 또 다른 버튼"으로 읽히면
          어색하다 — 그래서 채우지 않고 테두리만 준다(secondary-600 글씨 5.11:1). */}
      <span
        aria-hidden
        className="border-secondary-300 text-secondary-600 shrink-0 rounded-full border bg-white px-3 py-1.5 text-xs font-semibold"
      >
        입장
      </span>
    </Link>
  );
}
