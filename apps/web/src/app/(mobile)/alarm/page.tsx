import BasicLayout from '@/components/layout/BasicLayout';
import { NAV_TYPE } from '@/components/layout/BottomNav';

import AlarmContainer from './components/AlarmContainer';

const Alarm = () => {
  return (
    <BasicLayout title="알림" hasBottomNav navType={NAV_TYPE.ALARM}>
      <AlarmContainer />
    </BasicLayout>
  );
};

export default Alarm;
