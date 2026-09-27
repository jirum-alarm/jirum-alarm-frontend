import Dashboard from './components/Dashboard';

const DashboardPage = async () => {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white">대시보드</h2>
      </div>
      <Dashboard />
    </>
  );
};

export default DashboardPage;
