import { ArrowRight, RoundedLogo, Search } from '@/components/common/icons';
import React, { useEffect, useRef, useState } from 'react';
import HomeHeader from './HomeHeader';
import HomeBottomNav from './HomeBottomNav';
import SearchButton from './SearchButton';

const HomeContainerV2 = () => {
  return (
    <div className="mx-auto max-w-screen-sm">
      <HomeHeader />
      <div className="bg-gray-900">
        <div className="sticky top-0">
          <header className="flex h-[56px] w-full items-center justify-between px-5 py-3">
            <div className="flex items-center gap-2">
              <RoundedLogo />
              <h2 className="text-lg font-semibold text-white">지름알림</h2>
            </div>
            <SearchButton />
          </header>
          <div className="px-5 py-2">
            <button className="flex h-[64px] w-full items-center justify-between bg-gray-800 px-4 py-3">
              <p className="text-left">
                <span className="text-sm text-gray-100">핫딜을 더 빠르게 보고 싶다면?</span>
                <br />
                <span className="text-xs text-gray-200">
                  키워드 알림으로 원하는 핫딜만 골라 보세요!
                </span>
              </p>
              <ArrowRight color="#E4E7EC" />
            </button>
          </div>
        </div>
        <main className="z-1 relative h-[200vh] w-full rounded-t-[1.25rem] bg-gray-100">
          <section>
            <h2>지름알림 랭킹</h2>
            <div className="item">Item 1</div>
            <div className="item">Item 2</div>
            <div className="item">Item 3</div>
            <h2>지름알림 랭킹</h2>
            <div className="item">Item 1</div>
            <div className="item">Item 2</div>
            <div className="item">Item 3</div>
            <h2>지름알림 랭킹</h2>
            <div className="item">Item 1</div>
            <div className="item">Item 2</div>
            <div className="item">Item 3</div>
            <h2>지름알림 랭킹</h2>
            <div className="item">Item 1</div>
            <div className="item">Item 2</div>
            <div className="item">Item 3</div>
            <h2>지름알림 랭킹</h2>
            <div className="item">Item 1</div>
            <div className="item">Item 2</div>
            <div className="item">Item 3</div>
          </section>
        </main>
      </div>
      <HomeBottomNav />
    </div>
  );
};

export default HomeContainerV2;
