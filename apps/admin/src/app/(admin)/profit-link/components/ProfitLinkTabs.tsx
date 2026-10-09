'use client';

import { useState } from 'react';

import Tabs from '@/components/Tabs';

import ProfitLinkDashboard from './ProfitLinkDashboard';
import ProfitLinkOpsPanel from './ProfitLinkOpsPanel';

const TABS = [
  { value: 'dashboard', label: '대시보드' },
  { value: 'ops', label: '발급·세션' },
] as const;

const ProfitLinkTabs = () => {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['value']>('dashboard');

  return (
    <div className="flex flex-col gap-6">
      <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} />
      {activeTab === 'dashboard' && <ProfitLinkDashboard />}
      {activeTab === 'ops' && <ProfitLinkOpsPanel />}
    </div>
  );
};

export default ProfitLinkTabs;
