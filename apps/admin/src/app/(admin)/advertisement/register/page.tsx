import AdForm from '../components/AdForm';

const AdRegisterPage = async () => {
  return (
    <>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl font-semibold text-black dark:text-white sm:text-2xl">광고 등록</h2>
      </div>
      <AdForm mode="create" />
    </>
  );
};

export default AdRegisterPage;
