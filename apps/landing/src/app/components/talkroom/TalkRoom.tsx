'use client';

import { motion, useInView } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';

import SectionHeader from '../SectionHeader';

const Talk = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(targetRef, { amount: 'some', margin: '-30%' });

  return (
    <section className="relative flex min-h-screen w-full snap-center snap-always flex-col items-center justify-center bg-white lg:min-h-[200vh]">
      <div className="sticky inset-0 bottom-auto flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden">
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
        <motion.div
          initial={{ x: '-264px' }}
          animate={{ x: !isInView ? '0px' : '-264px' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="mb-7 flex flex-col gap-x-6 gap-y-5 px-5 lg:ml-138 lg:flex-row lg:px-0"
        >
          <div className="relative w-full lg:h-70 lg:w-132">
            <Image src="/images/talk-1.png" alt="카톡방 이미지 1" width={1056} height={560} />
          </div>
          <div className="relative w-full lg:h-70 lg:w-132">
            <Image src="/images/talk-2.png" alt="카톡방 이미지 2" width={1056} height={560} />
          </div>
        </motion.div>
        <Link href="#" className="flex gap-x-2 rounded-lg bg-gray-700 px-7 py-2.5">
          <span className="font-bold text-white">핫딜 카톡방 입장하기</span>
          <Image src="/icons/katalk.svg" alt="kakao" width={24} height={24} />
        </Link>
      </div>
      <div ref={targetRef} className="absolute bottom-0 hidden w-full lg:block" />
    </section>
  );
};

export default Talk;
