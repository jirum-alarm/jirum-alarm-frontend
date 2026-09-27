import GroupUpdate from './components/GroupUpdate';

const GroupUpdatePage = async ({ params }: { params: Promise<{ groupId: string }> }) => {
  const { groupId } = await params;
  return (
    <>
      <GroupUpdate groupId={groupId} />
    </>
  );
};

export default GroupUpdatePage;
