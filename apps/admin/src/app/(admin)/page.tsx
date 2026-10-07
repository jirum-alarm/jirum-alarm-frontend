import AttentionStrip from './components/AttentionStrip';
import Dashboard from './components/Dashboard';

const DashboardPage = async () => {
  return (
    <>
      <div className="mb-4 hidden lg:block">
        <h2 className="text-2xl font-semibold text-black dark:text-white">대시보드</h2>
      </div>
      <AttentionStrip />
      <Dashboard />
    </>
  );
};

export default DashboardPage;
