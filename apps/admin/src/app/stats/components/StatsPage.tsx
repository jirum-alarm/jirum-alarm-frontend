'use client';

import { useState } from 'react';

import EngagementStats from './EngagementStats';
import ProductStats from './ProductStats';
import UserStats from './UserStats';

type StatsTab = 'user' | 'product' | 'engagement';

const tabs: { key: StatsTab; label: string }[] = [
  { key: 'user', label: '사용자 통계' },
  { key: 'product', label: '상품/핫딜 통계' },
  { key: 'engagement', label: '사용자 참여 통계' },
];

const StatsPage = () => {
  const [activeTab, setActiveTab] = useState<StatsTab>('user');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 border-b border-stroke dark:border-strokedark">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-primary text-primary'
                : 'text-bodydark2 hover:text-black dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'user' && <UserStats />}
      {activeTab === 'product' && <ProductStats />}
      {activeTab === 'engagement' && <EngagementStats />}
    </div>
  );
};

export default StatsPage;
