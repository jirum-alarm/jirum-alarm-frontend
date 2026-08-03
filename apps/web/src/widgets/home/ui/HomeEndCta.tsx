import Link from 'next/link';

import { ArrowRight } from '@/shared/ui/common/icons';

const HomeEndCta = () => {
  return (
    <div className="flex flex-col items-center gap-y-3 border-t border-gray-100 py-12 text-center">
      <p className="text-sm font-medium text-gray-500">추천 핫딜을 모두 확인했어요</p>
      <Link
        href="/trending/live"
        className="bg-secondary-600 hover:bg-secondary-700 flex items-center gap-x-1 rounded-full px-6 py-3 text-sm font-semibold text-white"
      >
        실시간 특가 더 보기
        <ArrowRight color="#ffffff" className="size-4" />
      </Link>
    </div>
  );
};

export default HomeEndCta;
