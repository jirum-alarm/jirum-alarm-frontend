import AboutLink from '../banner/AboutLink';
import KakaoOpenChatLink from '../banner/KakaoOpenChatLink';

const Banner = () => {
  return (
    <div className="mb-10 mt-8 flex h-[120px] w-full gap-x-[25px] px-5">
      <KakaoOpenChatLink />
      <AboutLink />
    </div>
  );
};

export default Banner;
