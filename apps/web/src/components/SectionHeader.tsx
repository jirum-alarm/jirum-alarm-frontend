import React from 'react';

import { cn } from '@/lib/cn';

const SectionHeader = ({
  title,
  right,
  titleClassName,
}: {
  title: React.ReactNode;
  right?: React.ReactNode;
  titleClassName?: string;
}) => {
  return (
    <div className="flex h-[56px] items-center justify-between">
      <h2 className={cn('text-lg font-bold text-gray-900', titleClassName)}>{title}</h2>
      {right}
    </div>
  );
};

export default SectionHeader;
