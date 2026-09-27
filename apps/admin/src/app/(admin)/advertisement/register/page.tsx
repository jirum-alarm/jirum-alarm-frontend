import AdForm from '../components/AdForm';

const AdRegisterPage = async () => {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white">광고 등록</h2>
      </div>
      <AdForm mode="create" />
    </>
  );
};

export default AdRegisterPage;
