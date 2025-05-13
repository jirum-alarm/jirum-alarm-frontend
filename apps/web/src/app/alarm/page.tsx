import ApiErrorBoundary from '@/components/ApiErrorBoundary';
import BasicLayout from '@/components/layout/BasicLayout';
import { NAV_TYPE } from '@/components/layout/BottomNav';

import { getAccessToken } from '../actions/token';

import AlarmList, { NoLogin } from './components/AlarmList';

const Alarm = async () => {
  const isLoggedIn = await getAccessToken();

  if (!isLoggedIn) {
    return <NoLogin />;
  }

  return (
    <BasicLayout title="알림" hasBottomNav navType={NAV_TYPE.ALARM}>
      <ApiErrorBoundary>
        <AlarmList />
      </ApiErrorBoundary>
    </BasicLayout>
  );
};

export default Alarm;
