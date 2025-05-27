'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';
import { useRef } from 'react';

import AppDownload from '../key-visual/AppDownload';

const Banner = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start start'] });

  const y = useTransform(scrollYProgress, [0, 1], ['30%', '-15%']);

  return (
    <section
      ref={ref}
      className="mx-auto flex h-screen w-full max-w-7xl flex-col-reverse justify-end pt-16 lg:mt-20 lg:flex-row lg:justify-between lg:gap-x-58 lg:px-20 lg:pt-18"
    >
      <div className="flex shrink-0 flex-col items-center justify-center gap-y-2 pb-18 lg:items-start lg:pb-0">
        <p className="font-semibold text-white lg:text-2xl">핫딜을 누구보다 빠르게 구매해보세요!</p>
        <h3 className="text-[22px] font-bold text-white lg:text-[28px]">지름알림 다운로드하기</h3>
        <AppDownload type="footer" />
      </div>
      <div className="mt-[5vh] flex max-h-[60vh] items-center justify-center px-5 pt-3 lg:px-0">
        <motion.div style={{ y }} className="my-[10vh] aspect-[240/340] h-full">
          <Image
            src="/images/banner.png"
            alt="banner"
            width={956}
            height={1360}
            className="h-full w-full lg:h-auto"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Banner;
