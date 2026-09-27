// 첫 브랜드 아이템 페이지가 오기 전 전체 화면 로딩.
const LoadingScreen = () => (
  <div className="flex h-[calc(100vh-200px)] items-center justify-center rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
    <div className="text-center">
      <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-gray-500">브랜드 상품 목록을 불러오는 중...</p>
    </div>
  </div>
);

export default LoadingScreen;
