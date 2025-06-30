import { IllustStandingSmall } from '@/components/common/icons';
import useScreen from '@/hooks/useScreenSize';

export default function MoreProductsSkeleton() {
  const { smd } = useScreen();

  return (
    <div className="grid animate-pulse grid-cols-3 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: smd ? 4 : 3 }).map((_, i) => (
        <div key={i} className="w-full">
          <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100">
            <IllustStandingSmall />
          </div>
          <div className="flex flex-col gap-1 pt-2">
            <div className="h-3 bg-gray-100"></div>
            <div className="h-3 w-1/2 bg-gray-100"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
