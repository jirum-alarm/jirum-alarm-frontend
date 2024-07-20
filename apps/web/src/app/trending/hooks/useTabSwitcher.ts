import useMoveListCenter from '@/hooks/useMoveListCenter';
import { useState } from 'react';

const useTabSwitcher = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { listRef, moveListCenter } = useMoveListCenter();
  const handleTabChange = (index: number, last: number) => {
    setActiveTab(index);
  };
  const handleClickTab = (e: React.MouseEvent<HTMLLIElement>) => {
    const { offsetLeft, offsetWidth } = e.currentTarget;
    moveListCenter({ offsetLeft, offsetWidth });
  };
  const handleSwitching = (index: number, type: 'move' | 'end') => {
    console.log('switching : ', index);
  };
  return {
    activeTab,
    handleTabChange,
    handleClickTab,
    handleSwitching,
    tabRef: listRef,
  };
};

export default useTabSwitcher;
