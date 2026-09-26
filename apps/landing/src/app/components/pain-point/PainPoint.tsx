'use client';

import { useInView } from 'motion/react';
import { useRef } from 'react';

import Bubble from './Bubble';

const PainPoint = () => {
  const ref = useRef<HTMLDivElement>(null);
  // 한 번만 재생한다 — 스크롤로 지나갔다 돌아올 때마다 다시 비워지면 읽던 걸 놓친다.
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  return (
    <section className="flex w-full flex-col items-center bg-white py-20 lg:py-40">
      <h2 className="mb-10 text-center text-[22px] font-bold lg:mb-20 lg:text-[40px]">
        쇼핑, 더 편하게 할 방법 없을까?
      </h2>
      <div ref={ref} className="flex w-full max-w-180 flex-col gap-y-5 px-7 lg:gap-y-8">
        <Bubble direction="left" type="default" isInView={isInView}>
          내가 원하는 제품은 왜 맨날 품절이지?
        </Bubble>
        <Bubble direction="right" type="inverted" delay={0.5} isInView={isInView}>
          최저가 검색하기 너무 귀찮아...
        </Bubble>
        <Bubble direction="left" type="default" delay={1} isInView={isInView}>
          가격이 떨어졌다가 올랐다가... <br className="lg:hidden" />
          대체 언제 사야해?
        </Bubble>
      </div>
    </section>
  );
};

export default PainPoint;
