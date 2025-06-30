import Button from '@/components/common/Button';
import { AlarmIllustError } from '@/components/common/icons';
import Link from '@/features/Link';

const NoAlerts = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center p-11">
      <AlarmIllustError />
      <div className="pb-8 pt-4">
        <p className="pb-2 text-2xl font-semibold text-gray-900">아직 도착한 알림이 없어요</p>
        <p className="text-gray-500">키워드를 등록하고 알림을 받아보세요.</p>
      </div>
      <Link href="/mypage/keyword">
        <Button size="md">키워드 등록</Button>
      </Link>
    </div>
  );
};

export default NoAlerts;
