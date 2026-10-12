import { cn } from '@/shared/lib/cn';
import { markOkachatJoined, OKACHAT_LINK } from '@/shared/lib/okachat';

import BannerItem from '../BannerItem';
import kakao from '../images/kakao.png';

const props = {
  href: OKACHAT_LINK,
  title: (
    <>
      <span>핫딜 전용 카톡방 </span>
      <strong>OPEN</strong>
    </>
  ),
  description: '오픈 카톡방에서 소식을 확인해보세요!',
  image: kakao,
  // eventName: EVENT.OPEN_KAKAO_TALK.NAME,
  className: 'bg-fixed-800 border-fixed-600',
};

// 상세 오카방 카드와 같은 이벤트·파라미터(shared/lib/okachat.ts) — placement 로 위치를 가른다.
// 입장으로도 기록 — 예전엔 홈에서 들어가도 상세의 오카방 권유가 계속 떴다.
const trackClick = () => {
  markOkachatJoined();
  (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
    event: 'okachat_prompt_click',
    placement: 'home_banner',
  });
};

const KakaoOpenChatLink = ({
  isMobile,
  className,
  priority,
}: {
  isMobile: boolean;
  className?: string;
  priority?: boolean;
}) => {
  return (
    <BannerItem
      {...props}
      className={cn(props.className, className)}
      isMobile={isMobile}
      priority={priority}
      onClick={trackClick}
    />
  );
};

export default KakaoOpenChatLink;
