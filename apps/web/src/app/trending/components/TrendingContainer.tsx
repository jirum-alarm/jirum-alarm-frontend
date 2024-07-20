'use client';
import SwipeableViews from 'react-swipeable-views';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import useTabSwitcher from '../hooks/useTabSwitcher';
import useTabCategories from '../hooks/useTabCategories';
import { Setting } from '@/components/common/icons';
import Link from 'next/link';

const TrendingContainer = () => {
  const { activeTab, handleTabChange, handleSwitching, handleClickTab, tabRef } = useTabSwitcher();
  const { categories } = useTabCategories();

  return (
    <Tabs
      className="h-fit w-full overflow-x-hidden border-none"
      selectedIndex={activeTab}
      onSelect={handleTabChange}
      defaultFocus
      disableUpDownKeys
    >
      <div className="relative w-full">
        <div className="w-full overflow-x-scroll scroll-smooth scrollbar-hide" ref={tabRef}>
          <TabList className={`whitespace-nowrap will-change-transform`}>
            {categories.map((category) => (
              <Tab
                onClick={handleClickTab}
                key={category.id}
                className="inline-block cursor-pointer border-b-2 border-b-transparent px-[6px] pb-[8px] pt-[10px] text-sm text-gray-600 shadow-none outline-none transition-all transition-none duration-300 mouse-hover:hover:font-medium mouse-hover:hover:text-gray-900 [&:not(:last-child)]:mr-2"
                selectedClassName="!border-b-primary-600 text-gray-900 font-medium"
              >
                {category.name}
              </Tab>
            ))}
          </TabList>
        </div>
        <Link
          className="absolute right-0 top-0 flex h-10 w-11 items-center justify-end bg-fade-to-white"
          href={'/mypage/categories'}
        >
          <Setting />
        </Link>
      </div>
      <SwipeableViews
        index={activeTab}
        onChangeIndex={handleTabChange}
        animateTransitions={true}
        onSwitching={handleSwitching}
        className="my-6 will-change-transform"
      >
        <TabPanel className="w-full">
          <div>전체1</div>
        </TabPanel>
        <TabPanel className="w-full">
          <div>전체2</div>
        </TabPanel>
        <TabPanel className="w-full">
          <div>전체3</div>
        </TabPanel>
        <TabPanel className="w-full">
          <div>전체4</div>
        </TabPanel>
        <TabPanel className="w-full">
          <div>전체5</div>
        </TabPanel>
        <TabPanel className="w-full">
          <div>전체6</div>
        </TabPanel>
        <TabPanel className="w-full">
          <div>전체7</div>
        </TabPanel>
        <TabPanel className="w-full">
          <div>전체8</div>
        </TabPanel>
        <TabPanel className="w-full">
          <div>전체9</div>
        </TabPanel>
        <TabPanel className="w-full">
          <div>전체10</div>
        </TabPanel>
        <TabPanel className="w-full">
          <div>전체11</div>
        </TabPanel>
        <TabPanel className="w-full">
          <div>전체12</div>
        </TabPanel>
      </SwipeableViews>
    </Tabs>
  );
};

export default TrendingContainer;
