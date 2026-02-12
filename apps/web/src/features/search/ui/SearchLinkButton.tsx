'use client';

import { motion } from 'motion/react';

import { PAGE } from '@/shared/config/page';
import { Search } from '@/shared/ui/common/icons';
import Link from '@/shared/ui/Link';

interface Props {
  color?: string;
  onClick?: () => void;
}

const SearchLinkButton = ({ color, onClick }: Props) => {
  return (
    <Link
      className="pc:m-0 pc:size-9 pc:p-0 pc:rounded-full pc:hover:bg-gray-400/20 -m-2 flex items-center justify-center p-2 duration-300"
      href={PAGE.SEARCH}
      onClick={onClick}
      aria-label="검색"
    >
      <motion.div
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className="flex h-full w-full items-center justify-center rounded-full"
      >
        <Search color={color} className="pc:size-7 size-6" />
      </motion.div>
    </Link>
  );
};

export default SearchLinkButton;
