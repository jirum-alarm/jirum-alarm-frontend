import { checkDevice } from '@/app/actions/agent';
import BottomNav from '@/components/layout/BottomNav';

export default async function BottomNavServer() {
  const { isJirumAlarmApp } = await checkDevice();
  return isJirumAlarmApp ? null : <BottomNav type={''} />;
  // return <BottomNav type={''} />;
}
