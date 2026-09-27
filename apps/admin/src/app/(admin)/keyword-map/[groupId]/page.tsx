import GroupDetail from './components/GroupDetail';

const GroupDetailPage = async ({ params }: { params: Promise<{ groupId: string }> }) => {
  const { groupId } = await params;
  return (
    <>
      <GroupDetail groupId={groupId} />
    </>
  );
};

export default GroupDetailPage;
