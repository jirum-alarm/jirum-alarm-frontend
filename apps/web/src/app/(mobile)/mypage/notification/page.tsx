import { Suspense } from 'react';

import BasicLayout from '@/shared/ui/layout/BasicLayout';

import PushStatusBanner from '@/features/mypage/ui/keyword/PushStatusBanner';
import PushSettingForm from '@/features/mypage/ui/notification/PushSettingForm';

const NotificationSettingPage = () => {
  return (
    <BasicLayout hasBackButton title="알림 설정">
      <div className="pc:pt-0 h-full px-5 pt-2 pb-8">
        <PushStatusBanner />
        <Suspense>
          <PushSettingForm />
        </Suspense>
      </div>
    </BasicLayout>
  );
};

export default NotificationSettingPage;
