'use client';

import QuickLinks from './QuickLinks';
import RecentProducts from './RecentProducts';
import StatsCards from './StatsCards';

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-6">
      <StatsCards />
      <QuickLinks />
      <RecentProducts />
    </div>
  );
};

export default Dashboard;
