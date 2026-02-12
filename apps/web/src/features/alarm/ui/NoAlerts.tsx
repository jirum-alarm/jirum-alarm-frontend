import Button from '@/shared/ui/common/Button';
import { AlarmIllustError } from '@/shared/ui/common/icons';
import Link from '@/shared/ui/Link';

const NoAlerts = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center p-11">
      <AlarmIllustError />
      <div className="pt-4 pb-8">
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
