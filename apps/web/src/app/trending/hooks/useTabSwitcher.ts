import useMoveListCenter from '@/hooks/useMoveListCenter';
import { useState, useRef } from 'react';
import Swiper from 'swiper';

const useTabSwitcher = () => {
  const swiperRef = useRef<Swiper>();
  const [activeTab, setActiveTab] = useState(0);
  // const [targetIndex, setTargetIndex] = useState(0);
  const { listRef, moveListCenter } = useMoveListCenter();
  const handleTabChange = (index: number) => {
    swiperRef.current?.slideTo(index);
    setActiveTab(index);
    // setTargetIndex(index);
  };
  const handleClickTab = (e: React.MouseEvent<HTMLLIElement>) => {
    const { offsetLeft, offsetWidth } = e.currentTarget;
    moveListCenter({ offsetLeft, offsetWidth });
  };

  // const handleProgressSwiper = (swiper: Swiper, progress: number) => {
  //   const currentTranslate = swiper.translate;
  //   const slideWidth = swiper.width;
  //   const newIndex = -currentTranslate / slideWidth;

  //   const direction = swiper.touches.diff < 0 ? 'forward' : 'backward';

  //   const threshold = 0.3;
  //   if (direction === 'forward') {
  //     setTargetIndex(newIndex % 1 >= threshold ? Math.ceil(newIndex) : Math.floor(newIndex));
  //   } else if (direction === 'backward') {
  //     setTargetIndex(newIndex % 1 <= 1 - threshold ? Math.floor(newIndex) : Math.ceil(newIndex));
  //   }
  // };
  return {
    swiperRef,
    // targetIndex,
    // handleProgressSwiper,
    activeTab,
    handleTabChange,
    handleClickTab,
    tabRef: listRef,
  };
};

export default useTabSwitcher;
