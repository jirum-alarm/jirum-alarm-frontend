import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

import { cn } from '@/lib/cn';

interface ViewerCountProps {
  count: number;
}

export const ViewerCount = ({ count }: ViewerCountProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false });

  return (
    <>
      <div ref={ref} className="relative top-0 h-0 w-full translate-y-[28px]" />
      <div className="sticky top-[56px] z-50 h-[48px] w-full">
        <div className="flex w-full items-center justify-center">
          <motion.div
            layout
            initial={{
              width: '100%',
              y: 0,
            }}
            animate={{
              width: isInView ? '100%' : 'auto',
              y: isInView ? 0 : 8,
            }}
            transition={{
              type: 'spring',
              stiffness: 500,
              mass: 0.5,
              damping: 25,
            }}
          >
            <motion.div
              layout
              className={cn(
                `flex h-[48px] items-center justify-center border bg-secondary-50 px-5`,
                'shrink-0 whitespace-nowrap',
              )}
              initial={{
                borderRadius: 0,
                borderColor: '#EFF4FF',
              }}
              animate={{
                borderRadius: isInView ? 0 : 48,
                borderColor: isInView ? '#EFF4FF' : '#B5CBFD',
              }}
            >
              <span className="text-sm text-gray-700">
                지금&nbsp;
                <strong className="font-semibold text-secondary-500">
                  {count.toLocaleString('ko-kr')}명
                </strong>
                이 보고 있어요
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};
