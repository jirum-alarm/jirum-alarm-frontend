import Image from 'next/image';

import AppDownload from '../key-visual/AppDownload';

// 마지막 설치 권유 — 다 읽고 내려온 사람이 위로 다시 올라가지 않게 같은 설치 버튼을 한 번 더. 라임 띠라 앞 구역과 확실히 갈린다.
const Banner = () => (
  <section id="install-band" className="w-full bg-white px-5 pt-4 pb-20 lg:px-8 lg:pb-32">
    <div className="bg-primary-500 relative mx-auto flex max-w-6xl flex-col items-center overflow-hidden rounded-3xl px-6 py-14 text-center break-keep lg:py-20">
      <Image
        src="/assets/icons/jirum.svg"
        alt=""
        width={180}
        height={180}
        className="pointer-events-none absolute -bottom-10 -left-8 size-36 rotate-12 opacity-30 lg:size-56"
      />
      <h2 className="text-fixed-900 relative text-[32px] leading-tight font-bold lg:text-[48px]">
        지금 받아 두고,
        <br />
        진짜 싼 순간을 먼저
      </h2>
      <p className="text-fixed-800 relative mt-3 text-base font-medium lg:text-lg">
        설치 무료 · 키워드 알림 무료
      </p>
      <div className="relative">
        <AppDownload type="footer" />
      </div>
    </div>
  </section>
);

export default Banner;
