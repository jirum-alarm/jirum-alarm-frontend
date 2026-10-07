import { Suspense } from 'react';

import BasicLayout from '@/shared/ui/layout/BasicLayout';

import PersonalInfoForm from '@/features/mypage/ui/account/PersonalInfoForm';

const PersonalPage = () => {
  return (
    <BasicLayout hasBackButton title="개인정보 수정">
      <div className="pc:pt-0 flex h-full flex-col px-5 pt-9 pb-9">
        <p className="pc:text-sm pc:font-normal pc:text-gray-700 text-2xl font-semibold">
          출생년도와 성별을 <br className="pc:hidden" />
          수정해주세요.
        </p>
        <Suspense>
          <PersonalInfoForm />
        </Suspense>
      </div>
    </BasicLayout>
  );
};

export default PersonalPage;
