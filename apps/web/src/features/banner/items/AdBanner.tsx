import { Advertisement } from '@/constants/advertisement';

import BannerItem from '../BannerItem';

const props = {
  href: Advertisement.Persil_20251124.url,
  title: (
    <>
      <span className="font-semibold text-white">{Advertisement.Persil_20251124.title}</span>
      {/* <span>{Advertisement.Beproc.description}</span> */}
    </>
  ),
  description: <span className="text-[#DEEBFF]">{Advertisement.Persil_20251124.description}</span>,
  image: '/persil_2511_banner.png',
  // eventName: EVENT.OPEN_KAKAO_TALK.NAME,
  className: 'bg-[url(/persil_2511_bg.svg)] bg-cover border-gray-700 bg-center',
};

const AdBanner = ({ isMobile }: { isMobile: boolean }) => {
  return <BannerItem {...props} isMobile={isMobile} isAd />;
};

export default AdBanner;
