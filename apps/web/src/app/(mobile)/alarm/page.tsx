import BasicLayout from '@/shared/ui/layout/BasicLayout';
import { NAV_TYPE } from '@/shared/ui/layout/BottomNav';

import AlarmContainer from '@/features/alarm/ui/AlarmContainer';
import AlarmHeaderActions from '@/features/alarm/ui/AlarmHeaderActions';

const Alarm = () => {
  return (
    <BasicLayout
      hasBottomNav
      navType={NAV_TYPE.ALARM}
      header={
        <header className="max-w-mobile-max fixed top-0 z-50 flex h-14 w-full items-center gap-x-1 border-b border-white bg-white px-5 text-black">
          <h1 className="text-lg font-bold text-black">알림</h1>
          <AlarmHeaderActions />
        </header>
      }
    >
      <AlarmContainer />
    </BasicLayout>
  );
};

export default Alarm;
