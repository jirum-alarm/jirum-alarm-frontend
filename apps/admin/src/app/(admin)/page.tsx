import AttentionStrip from './components/AttentionStrip';
import RevenueSummary from './components/RevenueSummary';
import TodayStats from './components/TodayStats';

// 홈 = 수익 + 손이 가야 하는 일 + 오늘 숫자. 추이 차트는 /stats (예전 홈 차트는 /stats 의 복제였다)
const DashboardPage = () => {
  return (
    <>
      <div className="mb-4 hidden lg:block">
        <h2 className="text-2xl font-semibold text-black dark:text-white">대시보드</h2>
      </div>
      <RevenueSummary />
      <AttentionStrip />
      <TodayStats />
    </>
  );
};

export default DashboardPage;
