import Button from './common/Button';
import { IllustWarning } from './common/icons';

interface ServerErrorProps {
  onClick: () => void;
}

const ServerError = ({ onClick }: ServerErrorProps) => {
  return (
    <div className="mx-auto flex h-[calc(100dvh)] max-w-screen-layout-max flex-col items-center justify-center">
      <div className="flex -translate-y-1/3 flex-col items-center">
        <div className="pb-[26px]">
          <IllustWarning />
        </div>
        <div className="pb-[28px] text-center">
          <div className="text-2xl font-semibold text-gray-900">서버에러가 발생했습니다</div>
          <div className="text-gray-500">잠시 후 다시 시도해주세요</div>
        </div>
        <Button size="md" onClick={onClick}>
          다시 시도
        </Button>
      </div>
    </div>
  );
};

export default ServerError;
