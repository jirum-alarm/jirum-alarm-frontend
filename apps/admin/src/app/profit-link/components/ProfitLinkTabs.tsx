'use client';

import { useState } from 'react';

import OhouSessionPanel from './OhouSessionPanel';
import ProfitLinkDashboard from './ProfitLinkDashboard';
import ThreeHaSessionPanel from './ThreeHaSessionPanel';
import TossSessionPanel from './TossSessionPanel';

type ProfitLinkTab = 'dashboard' | 'toss' | 'ohou' | 'threeHa';

const tabs: { key: ProfitLinkTab; label: string }[] = [
  { key: 'dashboard', label: '대시보드' },
  { key: 'toss', label: '토스' },
  { key: 'ohou', label: '오늘의집' },
  { key: 'threeHa', label: '세시간전 세션' },
];

const ProfitLinkTabs = () => {
  const [activeTab, setActiveTab] = useState<ProfitLinkTab>('dashboard');

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

      {activeTab === 'dashboard' && <ProfitLinkDashboard />}
      {activeTab === 'toss' && <TossSessionPanel />}
      {activeTab === 'ohou' && <OhouSessionPanel />}
      {activeTab === 'threeHa' && <ThreeHaSessionPanel />}
    </div>
  );
};

export default ProfitLinkTabs;
