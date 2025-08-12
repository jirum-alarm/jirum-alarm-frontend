import { cn } from '@/lib/cn';

const SliderDots = ({ total, activeIndex }: { total: number; activeIndex: number }) => (
  <div className="pc:w-[100px] mx-auto flex h-5 w-full items-center justify-center" role="tablist">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        role="tab"
        aria-selected={activeIndex === i}
        aria-label={`슬라이드 ${i + 1}`}
        className={cn(
          `pc:grow pc:bg-gray-500 h-[3px] w-[3px] bg-gray-400`,
          activeIndex === i &&
            'pc:w-[32px] pc:bg-gray-300 mr-[6px] ml-[6px] h-[4px] w-[4px] bg-gray-600',
        )}
      />
    ))}
  </div>
);

export default SliderDots;
