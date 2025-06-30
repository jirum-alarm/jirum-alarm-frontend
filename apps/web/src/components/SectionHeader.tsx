import { ReactNode } from 'react';

import { cn } from '@/lib/cn';

const SectionHeader = ({
  title,
  right,
  titleClassName,
  isMobile = true,
}: {
  title: ReactNode;
  right?: ReactNode;
  titleClassName?: string;
  isMobile?: boolean;
}) => {
  return (
    <div className="relative flex h-[56px] w-full items-center justify-between">
      {!isMobile && <div className="hidden lg:block" />}
      <h2
        className={cn(
          'text-lg font-bold text-gray-900',
          !isMobile && 'lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:text-[28px]',
          titleClassName,
        )}
      >
        {title}
      </h2>
      {right}
    </div>
  );
};

export default SectionHeader;
