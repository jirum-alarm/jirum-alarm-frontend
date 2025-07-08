import withCheckDevice from '@/components/hoc/withCheckDevice';

import BannerItem from './BannerItem';
import landing from './images/landing.png';

const props = {
  href: 'https://about-us.jirum-alarm.com/',
  title: (
    <>
      <span>지름알림, </span>
      <strong>어떻게 쓰나요?</strong>
    </>
  ),
  description: '소개 페이지에서 한 눈에 알아보세요!',
  image: landing,
  // eventName: EVENT.OPEN_KAKAO_TALK.NAME,
  className: 'bg-[#193E21] border-[#34673C]',
};

const AboutLink = ({ isMobile }: { isMobile: boolean }) => {
  const handleClick = () => {
    // TODO: Need GTM Migration
    // mp?.track(EVENT.OPEN_KAKAO_TALK.NAME, {
    //   page: EVENT.PAGE.HOME,
    // });
  };

  return <BannerItem {...props} isMobile={isMobile} />;
};

export default withCheckDevice(AboutLink);
