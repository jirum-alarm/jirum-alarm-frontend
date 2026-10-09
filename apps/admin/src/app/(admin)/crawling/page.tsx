import CrawlingPage from './components/CrawlingPage';

const CrawlingPageRoute = async () => {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white">크롤링 현황</h2>
        <p className="mt-1 text-sm text-bodydark2">커뮤니티별 수집 상태와 추이, 썸네일 수집률.</p>
      </div>
      <CrawlingPage />
    </>
  );
};

export default CrawlingPageRoute;
