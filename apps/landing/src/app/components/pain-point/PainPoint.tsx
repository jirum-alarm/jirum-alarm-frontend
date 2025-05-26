'use client';

import { useInView } from 'motion/react';
import { useRef } from 'react';

import Bubble from './Bubble';

const PainPoint = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);
  return (
    <section className="flex h-screen w-full snap-center flex-col items-center justify-center bg-white">
      <h2 className="mb-20 text-center text-[40px] font-bold">쇼핑, 더 편하게 할 방법 없을까?</h2>
      <div ref={ref} className="flex w-180 flex-col gap-y-[3vh]">
        {isInView && (
          <>
            <Bubble text="내가 원하는 제품은 왜 맨날 품절이지?" direction="left" type="default" />
            <Bubble
              text="최저가 검색하기 너무 귀찮아..."
              direction="right"
              type="inverted"
              delay={1}
            />
            <Bubble
              text="가격이 떨어졌다가 올랐다가... 대체 언제 사야해?"
              direction="left"
              type="default"
              delay={1.4}
            />
          </>
        )}
      </div>
    </section>
  );
};

export default PainPoint;
