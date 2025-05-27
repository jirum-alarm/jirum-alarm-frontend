import { motion } from 'motion/react';

import { cn } from '@/shared/libs/cn';

type BubbleProps = {
  children: React.ReactNode;
  direction: 'left' | 'right';
  type: 'default' | 'inverted';
  delay?: number;
};

const Bubble = ({ children, direction, type, delay }: BubbleProps) => {
  const textStyle = [
    'text-lg lg:text-xl',
    type === 'default'
      ? 'text-primary-500 bg-gray-900 font-semibold'
      : 'bg-primary-500 text-gray-900 font-bold',
  ];
  const tail = [
    'before:absolute before:top-1/2 before:h-5.5 before:w-5.75 before:-translate-y-1/2 before:mask-[url(/icons/bubble-tail.svg)] before:bg-cover before:bg-center before:bg-no-repeat before:content-[""]',
    direction === 'left' ? 'before:-left-3' : 'before:-right-3 before:rotate-180',
    type === 'default' ? 'before:bg-gray-900' : 'before:bg-primary-500',
  ];

  return (
    <div className={cn('flex', direction === 'left' ? 'justify-start' : 'justify-end')}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: delay }}
        className={cn(['relative rounded-3xl px-5 py-3', ...textStyle, ...tail])}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default Bubble;
