'use client';

import { useState } from 'react';

import CommunityCrawlerStats from './CommunityCrawlerStats';
import ProviderHealthGrid from './ProviderHealthGrid';
import ThumbnailStats from './ThumbnailStats';

type CrawlingTab = 'community' | 'thumbnail';

const tabs: { key: CrawlingTab; label: string }[] = [
  { key: 'community', label: '커뮤니티 크롤러' },
  { key: 'thumbnail', label: '썸네일 워커' },
];

const CrawlingPage = () => {
  const [activeTab, setActiveTab] = useState<CrawlingTab>('community');

  return (
    <div className="flex flex-col gap-6">
      <ProviderHealthGrid />

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

      {activeTab === 'community' && <CommunityCrawlerStats />}
      {activeTab === 'thumbnail' && <ThumbnailStats />}
    </div>
  );
};

export default CrawlingPage;
