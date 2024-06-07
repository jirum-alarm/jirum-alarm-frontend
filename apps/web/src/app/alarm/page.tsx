import BasicLayout from '@/components/layout/BasicLayout';
import AlarmList from './components/AlarmList';

const Alarm = () => {
  return (
    <BasicLayout hasBackButton title="알림">
      <AlarmList />
    </BasicLayout>
  );
};

export default Alarm;
