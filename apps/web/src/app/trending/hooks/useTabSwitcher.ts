import { useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';
import Swiper from 'swiper';

import { PAGE } from '@/constants/page';
import useMoveListCenter from '@/hooks/useMoveListCenter';

const useTabSwitcher = () => {
  const swiperRef = useRef<Swiper>();
  const searchParams = useSearchParams();
  const search = searchParams.get('tab');
  const router = useRouter();
  const activeTab = search ? Number(search) : 0;
  const { listRef, moveListCenter } = useMoveListCenter();

  const handleTabChange = (index: number) => {
    swiperRef.current?.slideTo(index);
    router.push(`${PAGE.TRENDING}?tab=${index}`);
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
    activeTab,
    handleTabChange,
    handleClickTab,
    tabRef: listRef,
  };
};

export default useTabSwitcher;
