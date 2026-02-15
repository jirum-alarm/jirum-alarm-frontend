import { getAccessToken } from '@/app/actions/token';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

import GroupUpdate from './components/GroupUpdate';

const GroupUpdatePage = async ({ params }: { params: Promise<{ groupId: string }> }) => {
  const { groupId } = await params;
  const token = await getAccessToken();
  return (
    <DefaultLayout isLoggedIn={!!token}>
      <GroupUpdate groupId={groupId} />
    </DefaultLayout>
  );
};

export default GroupUpdatePage;
