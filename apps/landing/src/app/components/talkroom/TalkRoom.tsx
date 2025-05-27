'use client';

import { motion, useInView, useMotionValue, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';

import SectionHeader from '../SectionHeader';

const Talk = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(targetRef);

  return (
    <section className="snap-cetnter relative flex min-h-[200vh] w-full snap-always flex-col items-center justify-center bg-white">
      <div className="sticky inset-0 bottom-auto flex min-h-screen w-full flex-col items-center justify-center">
        <SectionHeader
          keyword="오픈카톡방"
          title={
            <>
              <span>가볍게 시작!</span>
              <br />
              <span>카톡으로 핫딜 먼저 만나보세요</span>
            </>
          }
          className="bg-white lg:pt-16 lg:pb-20"
        />
        {/* <div className="absolute left-1/2 h-20 w-132 -translate-x-1/2 bg-amber-300" /> */}
        <motion.div
          initial={{ x: 'calc(50% - 264px)' }}
          animate={{ x: isInView ? '0px' : 'calc(50% - 264px)' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="mb-7 flex gap-x-6"
        >
          <div className="relative h-70 w-132">
            <Image src="/images/talk-1.png" alt="카톡방 이미지 1" width={1056} height={560} />
          </div>
          <div className="relative h-70 w-132">
            <Image src="/images/talk-2.png" alt="카톡방 이미지 2" width={1056} height={560} />
          </div>
        </motion.div>
        <Link href="#" className="flex gap-x-2 rounded-lg bg-gray-700 px-7 py-2.5">
          <span className="font-bold text-white">핫딜 카톡방 입장하기</span>
          <Image src="/icons/katalk.svg" alt="kakao" width={24} height={24} />
        </Link>
      </div>
      <div ref={targetRef} className="mt-2/3 w-full flex-1" />
    </section>
  );
};

export default Talk;
