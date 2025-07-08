import { ReactNode } from 'react';

import { cn } from '@/lib/cn';

const SectionHeader = ({
  title,
  right,
  titleClassName,
}: {
  title: ReactNode;
  right?: ReactNode;
  titleClassName?: string;
}) => {
  return (
    <div className="relative flex h-[56px] w-full items-center justify-between">
      <div className="hidden pc:block" />
      <h2
        className={cn(
          'text-lg font-bold text-gray-900 pc:absolute pc:left-1/2 pc:-translate-x-1/2 pc:text-[28px]',
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
