import { cn } from '@/shared/libs/cn';

const SectionHeader = ({
  keyword,
  title,
  className,
}: {
  keyword: string;
  title: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn('flex w-full flex-col items-center justify-end', className)}>
      <div className="flex flex-col items-center gap-y-2">
        <p className="font-bold text-gray-500">{keyword}</p>
        <h2 className="text-center text-[22px] font-bold lg:text-[40px]">{title}</h2>
      </div>
    </div>
  );
};

export default SectionHeader;
