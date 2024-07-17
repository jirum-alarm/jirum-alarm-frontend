import BasicLayout from '@/components/layout/BasicLayout';
import AlarmList from './components/AlarmList';
import { NAV_TYPE } from '@/components/layout/BottomNav';

const Alarm = () => {
  return (
    <BasicLayout hasBackButton title="알림" hasBottomNav navType={NAV_TYPE.ALARM}>
      <AlarmList />
    </BasicLayout>
  );
};

export default Alarm;
