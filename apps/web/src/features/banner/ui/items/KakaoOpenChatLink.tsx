import kakao from '../../images/kakao.png';
import BannerItem from '../BannerItem';

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

const KakaoOpenChatLink = ({ isMobile, priority }: { isMobile: boolean; priority?: boolean }) => {
  return <BannerItem {...props} isMobile={isMobile} priority={priority} />;
};

export default KakaoOpenChatLink;
