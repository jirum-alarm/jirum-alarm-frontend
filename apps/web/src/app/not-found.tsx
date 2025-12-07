import { PAGE } from '@shared/config/page';
import Button from '@shared/ui/Button';
import { IllustWarning } from '@shared/ui/icons';
import Link from '@shared/ui/Link';

const NotFoundPage = () => {
  return (
    <div className="max-w-mobile-max mx-auto flex h-[calc(100dvh)] flex-col items-center justify-center">
      <div className="flex -translate-y-1/3 flex-col items-center">
        <div className="pb-6.5">
          <IllustWarning />
        </div>
        <div className="pb-7 text-center">
          <div className="text-2xl font-semibold text-gray-900">페이지를 찾을 수 없어요</div>
          <div className="text-gray-500">홈으로 이동해 다양한 핫딜을 확인해보세요</div>
        </div>
        <Link href={PAGE.HOME}>
          <Button size="md">지름알림 홈</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
