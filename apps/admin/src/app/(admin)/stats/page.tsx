import StatsPage from './components/StatsPage';

const StatsPageRoute = async () => {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white">통계</h2>
      </div>
      <StatsPage />
    </>
  );
};

export default StatsPageRoute;
