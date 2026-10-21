'use client';

import { useEffect, useState } from 'react';

import { InstallLink } from '../key-visual/AppDownload';

/**
 * 모바일 하단 고정 「앱 받기」 — 히어로의 설치 버튼이 화면 위로 지나간 뒤부터, 마지막 설치 띠(#install-band)가 보이기 전까지만.
 * 폰으로 온 사람은 영상·카드·질문을 읽는 동안 설치 버튼을 다시 찾으러 위로 올라가지 않는다. PC 는 QR 이 할 일이라 띄우지 않는다.
 */
const StickyInstall = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('download');
    const band = document.getElementById('install-band');
    if (!hero || !band) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const pastHero = hero.getBoundingClientRect().bottom < 0;
      const beforeBand = band.getBoundingClientRect().top > window.innerHeight;
      setVisible(pastHero && beforeBand);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-20 border-t border-gray-100 bg-white/95 px-5 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-200 lg:hidden ${
        visible ? 'translate-y-0' : 'pointer-events-none translate-y-full'
      }`}
    >
      <InstallLink
        position="sticky"
        className="bg-primary-500 text-fixed-900 block w-full rounded-full py-3 text-center text-base font-bold"
      >
        앱 받기 · 무료
      </InstallLink>
    </div>
  );
};

export default StickyInstall;
