import { getAccessToken } from '@/app/actions/token';

import BasicLayout from '@/shared/ui/layout/BasicLayout';
import { NAV_TYPE } from '@/shared/ui/layout/BottomNav';
import PageHeader from '@/shared/ui/layout/PageHeader';

import AlarmContainer from '@/features/alarm/ui/AlarmContainer';
import AlarmHeaderActions from '@/features/alarm/ui/AlarmHeaderActions';
import MyPageShell from '@/features/mypage/ui/MyPageShell';

const Alarm = async () => {
  const page = (
    <BasicLayout
      hasBottomNav
      navType={NAV_TYPE.ALARM}
      header={<PageHeader title="알림" actions={<AlarmHeaderActions />} />}
    >
      <AlarmContainer />
    </BasicLayout>
  );
  // PC 로그인 사용자는 마이페이지와 같은 사이드바 틀(모바일은 MyPageShell 이 그대로 통과).
  // 비로그인은 앱 설치 QR 안내뿐이라 사이드바(프로필·내 메뉴)가 어울리지 않는다.
  return (await getAccessToken()) ? <MyPageShell>{page}</MyPageShell> : page;
};

export default Alarm;
