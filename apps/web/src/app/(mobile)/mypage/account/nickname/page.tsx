import { Suspense } from 'react';

import BasicLayout from '@/shared/ui/layout/BasicLayout';

import NicknameForm from '@/features/mypage/ui/account/NickNameForm';

const NickNamePage = () => {
  return (
    <BasicLayout hasBackButton title="닉네임 수정">
      <div className="pc:pt-0 flex h-full flex-col px-5 pt-9 pb-9">
        <p className="pc:text-sm pc:font-normal pc:text-gray-700 text-2xl font-semibold">
          변경할 닉네임을 <br className="pc:hidden" />
          입력해주세요.
        </p>
        <Suspense>
          <NicknameForm />
        </Suspense>
      </div>
    </BasicLayout>
  );
};

export default NickNamePage;
