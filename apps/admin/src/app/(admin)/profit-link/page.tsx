import ProfitLinkTabs from './components/ProfitLinkTabs';

const ProfitLinkPageRoute = async () => {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white">수익 링크</h2>
        <p className="mt-1 text-sm text-bodydark2">
          출처별 발급·판매 상태와 수익. 링크 직접 발급·세션 갱신은 「발급·세션」 탭.
        </p>
      </div>
      <ProfitLinkTabs />
    </>
  );
};

export default ProfitLinkPageRoute;
