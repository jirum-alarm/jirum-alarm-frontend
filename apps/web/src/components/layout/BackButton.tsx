'use client';

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
    <button className="p-2" onClick={handleClick} aria-label="뒤로 가기" title="뒤로 가기">
      <ArrowLeft width={28} height={28} />
    </button>
  );
};

export default BackButton;
