'use client';

import React, { useState, useEffect } from 'react';
import { IProduct } from '@/graphql/interface';
import LikeButton from './LikeButton';
import Button from '@/components/common/Button';
import { EVENT } from '@/constants/mixpanel';
import { mp } from '@/lib/mixpanel';
import { BiSolidMessageDetail } from 'react-icons/bi';
import { throttle } from 'lodash';

function BottomCTA({
  product,
  isUserLogin,
  detailUrl,
}: {
  product: IProduct;
  isUserLogin: boolean;
  detailUrl: string;
}) {
  const [showFloatingMessage, setShowFloatingMessage] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const affiliateKeywords = ['coupang'];
  const shouldShowMessage = affiliateKeywords.some((keyword) => detailUrl.includes(keyword));

  useEffect(() => {
    const handleScroll = throttle(() => {
      const isBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
      setShowFloatingMessage(isBottom && shouldShowMessage);
    }, 100);

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      handleScroll.cancel();
    };
  }, [shouldShowMessage]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showFloatingMessage) {
      timer = setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
    return () => clearTimeout(timer);
  }, [showFloatingMessage]);

  const handleClickPurchaseLinkBrowse = () => {
    mp.track(EVENT.PRODUCT_PURCHASE_LINK_BROWSE.NAME, {
      page: EVENT.PAGE.DETAIL,
    });
  };

  return (
    <div className="fixed bottom-0 z-40 ml-[-1px] flex w-full max-w-screen-layout-max flex-col border border-gray-200 bg-white px-5 pb-6 pt-2">
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          showFloatingMessage ? 'mb-2 max-h-20 opacity-100' : 'mb-0 max-h-0 opacity-0'
        }`}
      >
        <div
          className={`flex items-center rounded-md bg-gray-100 px-3 py-2 transition-opacity duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="mr-2 flex flex-shrink-0 items-center justify-center">
            <BiSolidMessageDetail size={16} className="relative top-[1px] text-gray-500" />
          </div>
          <span className="flex-grow text-xs leading-tight text-gray-600">
            일부 링크는 제휴 마케팅이 적용되어 지름알림에 커미션이 지급될 수 있어요
          </span>
        </div>
      </div>
      <div className="flex w-full gap-x-2">
        <LikeButton product={product} isUserLogin={isUserLogin} />
        <a href={product.detailUrl} onClick={handleClickPurchaseLinkBrowse} className="w-full">
          <Button>구매하러 가기</Button>
        </a>
      </div>
    </div>
  );
}

export default React.memo(BottomCTA);
