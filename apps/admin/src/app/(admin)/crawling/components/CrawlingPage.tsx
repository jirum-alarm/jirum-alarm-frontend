'use client';

import { useState } from 'react';

import Tabs from '@/components/Tabs';

import CommunityCrawlerStats from './CommunityCrawlerStats';
import ProviderHealthGrid from './ProviderHealthGrid';
import ThumbnailStats from './ThumbnailStats';

const TABS = [
  { value: 'community', label: '커뮤니티 수집' },
  { value: 'thumbnail', label: '썸네일' },
] as const;

const CrawlingPage = () => {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['value']>('community');

  return (
    <div className="flex flex-col gap-6">
      <ProviderHealthGrid />
      <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} />
      {activeTab === 'community' && <CommunityCrawlerStats />}
      {activeTab === 'thumbnail' && <ThumbnailStats />}
    </div>
  );
};

export default CrawlingPage;
