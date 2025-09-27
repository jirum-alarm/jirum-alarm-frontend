import { Advertisement } from '@/constants/advertisement';
import { LANDING_URL } from '@/constants/env';

import BannerItem from '../BannerItem';
import beprocImg from '/public/beproc_ad_banner_img.png';

const props = {
  href: Advertisement.Beproc.url,
  title: (
    <>
      <span className="text-secondary-800 font-semibold">
        비프록 음식물 처리기 <b className="text-[#0036B1]">추석특가</b>
      </span>
      {/* <span>{Advertisement.Beproc.description}</span> */}
    </>
  ),
  description: (
    <span className="text-gray-700">
      오직 <b>지름알림</b>에서만 <b className="text-secondary-600">70% 할인</b>
    </span>
  ),
  image: beprocImg,
  // eventName: EVENT.OPEN_KAKAO_TALK.NAME,
  className: 'bg-gradient-to-tr from-[#E1E6EF] to-white border-gray-400',
};

const AdBanner = ({ isMobile }: { isMobile: boolean }) => {
  return <BannerItem {...props} isMobile={isMobile} isAd />;
};

export default AdBanner;
