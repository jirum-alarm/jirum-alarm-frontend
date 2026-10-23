import { text } from '@jirum/design-system/recipes';

import Button from './common/Button';
import { IllustWarning } from './common/icons';

interface ServerErrorProps {
  onClick: () => void;
}

const ServerError = ({ onClick }: ServerErrorProps) => {
  return (
    <div className="max-w-mobile-max mx-auto flex h-[calc(100dvh)] flex-col items-center justify-center">
      <div className="flex -translate-y-1/3 flex-col items-center">
        <div className="pb-6.5">
          <IllustWarning />
        </div>
        <div className="pb-7 text-center">
          <div className={text.display}>화면을 불러오지 못했어요</div>
          <div className="text-gray-500">잠시 후 다시 시도해 주세요</div>
        </div>
        <Button size="md" onClick={onClick}>
          다시 시도
        </Button>
      </div>
    </div>
  );
};

export default ServerError;
