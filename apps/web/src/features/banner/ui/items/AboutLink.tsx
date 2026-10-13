import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';

import BannerItem from '../BannerItem';
import landing from '../images/landing.png';

const props = {
  // 서비스 안의 사용법·FAQ 로 — about-us 는 서비스 밖 독립 페이지라 다녀오면 흐름이 끊긴다.
  href: PAGE.HELP,
  newTab: false,
  title: (
    <>
      <span>지름알림, </span>
      <strong>어떻게 쓰나요?</strong>
    </>
  ),
  description: '사용법과 자주 묻는 질문을 모았어요',
  image: landing,
  // eventName: EVENT.OPEN_KAKAO_TALK.NAME,
  // eslint-disable-next-line no-restricted-syntax -- 소개 페이지 배너 고유색(짙은 초록, 앱 HomeBannerCarousel 과 같은 값)
  className: 'bg-[#193E21] border-[#34673C]',
};

const AboutLink = ({
  isMobile,
  className,
  priority,
}: {
  isMobile: boolean;
  className?: string;
  priority?: boolean;
}) => {
  const handleClick = () => {
    // TODO: Need GTM Migration
    // mp?.track(EVENT.OPEN_KAKAO_TALK.NAME, {
    //   page: EVENT.PAGE.HOME,
    // });
  };

  return (
    <BannerItem
      {...props}
      className={cn(props.className, className)}
      isMobile={isMobile}
      priority={priority}
    />
  );
};

export default AboutLink;
