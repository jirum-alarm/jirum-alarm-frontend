import BasicLayout from '@/shared/ui/layout/BasicLayout';
import { NAV_TYPE } from '@/shared/ui/layout/BottomNav';

import { AlarmContainer } from '@/features/alarm';

const Alarm = () => {
  return (
    <BasicLayout title="알림" hasBottomNav navType={NAV_TYPE.ALARM}>
      <AlarmContainer />
    </BasicLayout>
  );
};

export default Alarm;
