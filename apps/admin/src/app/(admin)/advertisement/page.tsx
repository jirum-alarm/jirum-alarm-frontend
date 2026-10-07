import AdListTable from './components/AdListTable';

const AdvertisementPage = async () => {
  return (
    <>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl font-semibold text-black dark:text-white sm:text-2xl">광고 관리</h2>
      </div>
      <AdListTable />
    </>
  );
};

export default AdvertisementPage;
