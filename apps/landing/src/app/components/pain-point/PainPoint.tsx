'use client';

import { useInView } from 'motion/react';
import { useRef } from 'react';

import { cn } from '@/shared/libs/cn';

import Bubble from './Bubble';

const PainPoint = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);
  return (
    <section className="flex h-screen max-h-lvh w-full snap-start flex-col items-center justify-center bg-white">
      <h2 className="py-10 text-center text-[22px] font-bold lg:mb-20 lg:py-0 lg:text-[40px]">
        쇼핑, 더 편하게 할 방법 없을까?
      </h2>
      <div ref={ref} className={cn('flex w-full max-w-180 flex-col gap-y-[3vh] px-7')}>
        <Bubble direction="left" type="default" isInView={isInView}>
          내가 원하는 제품은 왜 맨날 품절이지?
        </Bubble>
        <Bubble direction="right" type="inverted" delay={1} isInView={isInView}>
          최저가 검색하기 너무 귀찮아...
        </Bubble>
        <Bubble direction="left" type="default" delay={1.4} isInView={isInView}>
          가격이 떨어졌다가 올랐다가... <br className="lg:hidden" />
          대체 언제 사야해?
        </Bubble>
      </div>
    </section>
  );
};

export default PainPoint;
