import Button from '@/shared/ui/common/Button';
import { AlarmIllustError } from '@/shared/ui/common/icons';
import Link from '@/shared/ui/Link';

const NoAlerts = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center p-11">
      <AlarmIllustError />
      <div className="pt-4 pb-8">
        <p className="typography-headline-24sb text-fg-primary pb-2">아직 도착한 알림이 없어요</p>
        <p className="text-fg-secondary">키워드를 등록하고 알림을 받아보세요.</p>
      </div>
      <Link href="/mypage/keyword">
        <Button size="md">키워드 등록</Button>
      </Link>
    </div>
  );
};

export default NoAlerts;
