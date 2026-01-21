'use client';

import { motion } from 'motion/react';

import { Search } from '@/components/common/icons';
import BackButton from '@/components/layout/BackButton';
import { PAGE } from '@/constants/page';

import Link from '@shared/ui/Link';
import ShareButton from '@shared/ui/ShareButton';

import useRecommendedKeyword from '../hooks/useRecommendedKeyword';

export default function RecommendPageHeader() {
  const { recommendedKeyword: keyword } = useRecommendedKeyword();

  const title = keyword ? `${keyword} 추천 상품 | 지름알림` : '지금 추천하는 상품';

  return (
    <header className="max-w-mobile-max fixed top-0 z-40 flex h-14 w-full items-center justify-between bg-white px-5">
      <div className="flex grow items-center gap-x-1">
        <BackButton backTo={PAGE.HOME} />
        <motion.div
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.1 }}
          className="rounded-lg px-2 py-1"
        >
          <h2 className="text-lg font-semibold text-black">지금 추천하는 상품</h2>
        </motion.div>
      </div>
      <div className="flex items-center gap-x-4">
        <motion.div
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.1 }}
          className="rounded-lg"
        >
          <Link href={PAGE.SEARCH} aria-label="검색" title="검색" className="block p-2">
            <Search />
          </Link>
        </motion.div>
        <ShareButton title={title} />
      </div>
    </header>
  );
}
