'use client';

import { useState } from 'react';

import ProfitLinkDashboard from './ProfitLinkDashboard';
import TossSessionPanel from './TossSessionPanel';

type ProfitLinkTab = 'dashboard' | 'toss';

const tabs: { key: ProfitLinkTab; label: string }[] = [
  { key: 'dashboard', label: '대시보드' },
  { key: 'toss', label: '토스 세션' },
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
    </div>
  );
};

export default ProfitLinkTabs;
