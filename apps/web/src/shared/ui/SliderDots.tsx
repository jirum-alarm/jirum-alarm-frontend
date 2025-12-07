import { cn } from '@shared/lib/cn';

const SliderDots = ({ total, visibleSlides }: { total: number; visibleSlides: number[] }) => {
  // visibleSlides에 포함된 인덱스의 앞/뒤에 active가 있는지 확인해서 마진을 동적으로 부여
  return (
    <div
      className="pc:w-[100px] mx-auto flex h-5 w-full items-center justify-center"
      role="tablist"
    >
      {Array.from({ length: total }).map((_, i) => {
        const isActive = visibleSlides.includes(i);
        // 앞에 active가 있는지
        const prevActive = visibleSlides.includes(i - 1);
        // 뒤에 active가 있는지
        const nextActive = visibleSlides.includes(i + 1);

        // active가 아니면서, 앞이나 뒤에 active가 붙어있으면 마진을 준다
        const marginClass =
          !isActive && (prevActive || nextActive)
            ? prevActive
              ? 'ml-1.5'
              : nextActive
                ? 'mr-1.5'
                : ''
            : '';

        return (
          <div
            key={i}
            role="tab"
            aria-selected={isActive}
            aria-label={`슬라이드 ${i + 1}`}
            className={cn(
              'pc:grow pc:bg-gray-500 h-[3px] w-[3px] bg-gray-400 transition-all',
              isActive && 'pc:bg-gray-300 pc:h-[4px] pc:w-[4px] bg-gray-600',
              marginClass,
            )}
          />
        );
      })}
    </div>
  );
};

export default SliderDots;
