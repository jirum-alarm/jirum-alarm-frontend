import { ReactNode } from 'react';

import { cn } from '@/lib/cn';

const SectionHeader = ({
  title,
  right,
  titleClassName,
  shouldShowMobileUI,
}: {
  title: ReactNode;
  right?: ReactNode;
  titleClassName?: string;
  shouldShowMobileUI?: boolean;
}) => {
  return (
    <div className="relative flex h-14 w-full items-center justify-between">
      <div className={cn('hidden', { 'pc:block': !shouldShowMobileUI })} />
      <h2
        className={cn(
          'text-lg font-bold text-gray-900',
          !shouldShowMobileUI && 'pc:absolute pc:left-1/2 pc:-translate-x-1/2 pc:text-[28px]',
          titleClassName,
        )}
      >
        {title}
      </h2>
      {right}
    </div>
  );
};

console.log(cn('pc:text-[28px]', 'pc:text-2xl'));

export default SectionHeader;
