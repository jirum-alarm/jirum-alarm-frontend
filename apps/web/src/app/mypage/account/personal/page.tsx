import BasicLayout from '@/components/layout/BasicLayout';
import PersonalInfoForm from './components/PersonalInfoForm';
import { Suspense } from 'react';

const PersonalPage = () => {
  return (
    <BasicLayout hasBackButton title="개인정보 수정">
      <div className="flex h-full flex-col px-5 pb-9 pt-9">
        <p className="text-2xl font-semibold">
          출생년도와 성별을
          <br />
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
