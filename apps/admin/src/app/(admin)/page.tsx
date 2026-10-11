import AttentionStrip from './components/AttentionStrip';
import CommunityTrend from './components/CommunityTrend';
import RevenueSummary from './components/RevenueSummary';
import TodayStats from './components/TodayStats';
import UserSummary from './components/UserSummary';

// 홈 = 수익·사용자(합계·추이) + 손이 가야 하는 일 + 오늘 숫자 + 커뮤니티 수집 추이. 나머지 추이 차트는 /stats·/crawling
const DashboardPage = () => {
  return (
    <>
      <div className="mb-4 hidden lg:block">
        <h2 className="text-2xl font-semibold text-black dark:text-white">대시보드</h2>
      </div>
      <RevenueSummary />
      <UserSummary />
      <AttentionStrip />
      <TodayStats />
      <CommunityTrend />
    </>
  );
};

export default DashboardPage;
