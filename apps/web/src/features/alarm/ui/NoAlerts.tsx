import { text } from '@jirum/design-system/recipes';
import { ALARM_COPY } from '@jirum/domain/alarm';

import { cn } from '@/shared/lib/cn';
import Button from '@/shared/ui/common/Button';
import { AlarmIllustError } from '@/shared/ui/common/icons';
import Link from '@/shared/ui/Link';

const NoAlerts = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center p-11">
      <AlarmIllustError />
      <div className="pt-4 pb-8">
        <p className={cn(text.display, 'pb-2')}>{ALARM_COPY.emptyTitle}</p>
        <p className="text-gray-500">{ALARM_COPY.emptyBody}</p>
      </div>
      <Link href="/mypage/keyword">
        <Button size="md">{ALARM_COPY.emptyCta}</Button>
      </Link>
    </div>
  );
};

export default NoAlerts;
