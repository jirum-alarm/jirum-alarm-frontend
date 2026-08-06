import BasicLayout from '@/shared/ui/layout/BasicLayout';
import { NAV_TYPE } from '@/shared/ui/layout/BottomNav';
import PageHeader from '@/shared/ui/layout/PageHeader';

import AlarmContainer from '@/features/alarm/ui/AlarmContainer';
import AlarmHeaderActions from '@/features/alarm/ui/AlarmHeaderActions';

const Alarm = () => {
  return (
    <BasicLayout
      hasBottomNav
      navType={NAV_TYPE.ALARM}
      header={<PageHeader title="알림" actions={<AlarmHeaderActions />} />}
    >
      <AlarmContainer />
    </BasicLayout>
  );
};

export default Alarm;
