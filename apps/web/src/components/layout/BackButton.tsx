'use client';

import { motion } from 'motion/react';

import { PAGE } from '@/constants/page';
import useGoBack from '@/hooks/useGoBack';

import { ArrowLeft } from '../common/icons';

const BackButton = ({ backTo, onClick }: { backTo?: PAGE; onClick?: () => void }) => {
  const goBack = useGoBack(backTo);
  const handleClick = () => {
    onClick?.();
    goBack();
  };

  return (
    <motion.button
      className="relative -m-2 rounded-full p-2"
      onClick={handleClick}
      aria-label="뒤로 가기"
      title="뒤로 가기"
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      <ArrowLeft width={28} height={28} className="relative -left-2" />
    </motion.button>
  );
};

export default BackButton;
