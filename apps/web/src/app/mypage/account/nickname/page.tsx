import BasicLayout from '@/components/layout/BasicLayout';
import NicknameForm from './components/NickNameForm';
import { Suspense } from 'react';

const NickNamePage = () => {
  return (
    <BasicLayout hasBackButton title="닉네임 수정">
      <div className="flex h-full flex-col px-5 pb-9 pt-9">
        <p className="text-2xl font-semibold">
          변경할 닉네임을
          <br />
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
