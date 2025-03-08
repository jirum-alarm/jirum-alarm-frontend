'use client';

import Button from '@/components/common/Button';
import Illust from '@/components/common/Illust';
import BasicLayout from '@/components/layout/BasicLayout';
import useMyRouter from '@/hooks/useMyRouter';

const HOME_ROUTE = '/';

const Completed = () => {
  const router = useMyRouter();
  const handleCTAButton = () => {
    router.replace(HOME_ROUTE);
  };

  return (
    <BasicLayout fullScreen={false}>
      <div className="h-full px-5 py-9">
        <div className="grid h-full text-center">
          <div>
            <div className="grid justify-center pb-10">
              <Illust />
            </div>
            <div>
              <p className="pb-3 text-2xl font-semibold">가입을 축하합니다!</p>
              <p>
                실시간으로 올라오는 핫딜 정보를 확인하고
                <br />
                키워드를 등록해 관심있는 정보를 얻어보세요
              </p>
            </div>
          </div>
          <div className="fixed bottom-0 left-0 right-0 m-auto w-full max-w-[480px] px-5 pb-9">
            <Button onClick={handleCTAButton} className="self-end">
              핫딜 보러가기
            </Button>
          </div>
        </div>
      </div>
    </BasicLayout>
  );
};

export default Completed;
