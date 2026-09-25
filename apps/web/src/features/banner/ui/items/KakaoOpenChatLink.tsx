import { cn } from '@/shared/lib/cn';

import BannerItem from '../BannerItem';
import kakao from '../images/kakao.png';

const props = {
  href: 'https://open.kakao.com/o/gJZTWAAg',
  title: (
    <>
      <span>핫딜 전용 카톡방 </span>
      <strong>OPEN</strong>
    </>
  ),
  description: '오픈 카톡방에서 소식을 확인해보세요!',
  image: kakao,
  // eventName: EVENT.OPEN_KAKAO_TALK.NAME,
  className: 'bg-gray-800 border-gray-600',
};

// 상세 오카방 카드와 같은 이벤트·파라미터(features/product-detail/lib/okachat.ts) — placement 로 위치를 가른다.
const trackClick = () => {
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
