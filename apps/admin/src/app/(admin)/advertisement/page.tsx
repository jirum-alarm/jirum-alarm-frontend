import AdListTable from './components/AdListTable';

const AdvertisementPage = async () => {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white">광고 관리</h2>
      </div>
      <AdListTable />
    </>
  );
};

export default AdvertisementPage;
