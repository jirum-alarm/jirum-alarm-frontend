import AdCloneLoader from './components/AdCloneLoader';

const AdClonePage = async ({ params }: { params: Promise<{ adId: string }> }) => {
  const { adId } = await params;
  return (
    <>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl font-semibold text-black sm:text-2xl dark:text-white">광고 복제</h2>
      </div>
      <AdCloneLoader adId={adId} />
    </>
  );
};

export default AdClonePage;
