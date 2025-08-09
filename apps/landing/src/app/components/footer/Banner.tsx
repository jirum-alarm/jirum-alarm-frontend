'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';
import { useRef } from 'react';

import AppDownload from '../key-visual/AppDownload';

const MotionImage = motion.create(Image);

const Banner = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start start'] });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '-13%']);

  return (
    <section
      ref={ref}
      className="mx-auto flex h-screen w-[80vw] max-w-7xl flex-col-reverse items-center justify-center pt-16 lg:flex-row lg:justify-between lg:pt-18"
    >
      <div className="flex shrink-0 flex-col items-center justify-center gap-y-2 pb-18 lg:items-start lg:pb-0">
        <p className="font-semibold text-white lg:text-2xl">핫딜을 누구보다 빠르게 구매해보세요!</p>
        <h3 className="text-[22px] font-bold text-white lg:text-[28px]">바로 다운로드하기</h3>
        <AppDownload type="footer" />
      </div>
      <div className="flex h-full max-h-[50vh] w-full max-w-[50vh] justify-end lg:max-h-[75vh] lg:max-w-160">
        <MotionImage
          unoptimized
          style={{ y }}
          className="aspect-[240/340] object-contain lg:object-right"
          src="/assets/images/banner.png"
          alt="지름알림 화면"
          width={956}
          height={1360}
        />
      </div>
    </section>
  );
};

export default Banner;
