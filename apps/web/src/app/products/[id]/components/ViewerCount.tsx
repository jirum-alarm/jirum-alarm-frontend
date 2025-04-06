import { useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { cn } from '@/lib/cn';

interface ViewerCountProps {
  count: number;
}

export const ViewerCount = ({ count }: ViewerCountProps) => {
  const [isView, setIsView] = useState(true);
  const { ref } = useInView({
    threshold: 1,
    onChange: (inView) => {
      setIsView(inView);
    },
  });
  return (
    <>
      <div ref={ref} className="relative top-0 h-0 w-full translate-y-[48px]" />
      <div className="sticky top-[56px] z-50 h-[48px] w-full">
        <div className="flex w-full items-center justify-center">
          <div
            className={cn(
              `flex h-[48px] w-full items-center justify-center border-b border-secondary-200 bg-secondary-50 text-sm text-gray-600 transition-all`,
              {
                'w-fit translate-y-[8px] rounded-full border px-5': !isView,
              },
            )}
          >
            지금&nbsp;
            <strong className="font-semibold text-secondary-500">
              {count.toLocaleString('ko-kr')}명
            </strong>
            이 보고 있어요
          </div>
        </div>
      </div>
    </>
  );
};
