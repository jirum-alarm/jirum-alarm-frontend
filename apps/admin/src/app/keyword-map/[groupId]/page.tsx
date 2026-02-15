import { getAccessToken } from '@/app/actions/token';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

import GroupDetail from './components/GroupDetail';

const GroupDetailPage = async ({ params }: { params: Promise<{ groupId: string }> }) => {
  const { groupId } = await params;
  const token = await getAccessToken();
  return (
    <DefaultLayout isLoggedIn={!!token}>
      <GroupDetail groupId={groupId} />
    </DefaultLayout>
  );
};

export default GroupDetailPage;
