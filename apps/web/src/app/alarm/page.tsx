import AlarmList from './components/AlarmList';

import BasicLayout from '@/components/layout/BasicLayout';
import { NAV_TYPE } from '@/components/layout/BottomNav';

const Alarm = () => {
  return (
    <BasicLayout title="알림" hasBottomNav navType={NAV_TYPE.ALARM}>
      <AlarmList />
    </BasicLayout>
  );
};

export default Alarm;
