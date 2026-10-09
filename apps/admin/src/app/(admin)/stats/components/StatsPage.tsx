'use client';

import { useState } from 'react';

import Tabs from '@/components/Tabs';

import EngagementStats from './EngagementStats';
import ProductStats from './ProductStats';
import UserStats from './UserStats';

const TABS = [
  { value: 'user', label: '사용자' },
  { value: 'product', label: '상품·핫딜' },
  { value: 'engagement', label: '참여' },
] as const;

const StatsPage = () => {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['value']>('user');

  return (
    <div className="flex flex-col gap-6">
      <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} />
      {activeTab === 'user' && <UserStats />}
      {activeTab === 'product' && <ProductStats />}
      {activeTab === 'engagement' && <EngagementStats />}
    </div>
  );
};

export default StatsPage;
