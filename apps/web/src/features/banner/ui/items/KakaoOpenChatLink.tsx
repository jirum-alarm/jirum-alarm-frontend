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
    />
  );
};

export default KakaoOpenChatLink;
