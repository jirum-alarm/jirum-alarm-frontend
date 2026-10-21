import { cn } from '@/shared/libs/cn';

// 구역 제목 — 작은 알약(무슨 구역인지) + 큰 제목 + 한 줄 설명. 구역마다 같은 모양이라 훑어 내려가기 쉽다.
const SectionHeader = ({
  keyword,
  title,
  sub,
  className,
}: {
  keyword: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn('flex w-full flex-col items-center px-5 text-center break-keep', className)}>
      <p className="bg-primary-100 text-primary-800 rounded-full px-3 py-1 text-sm font-semibold">
        {keyword}
      </p>
      <h2 className="text-28 mt-4 leading-tight font-bold text-gray-900 lg:text-[44px]">{title}</h2>
      {sub ? <p className="mt-3 text-base text-gray-600 lg:text-lg">{sub}</p> : null}
    </div>
  );
};

export default SectionHeader;
