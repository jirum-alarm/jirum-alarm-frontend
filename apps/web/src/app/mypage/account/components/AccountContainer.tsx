'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import AccountManagement from './AccountManagement';
import MovePage from './MovePage';
import { AuthQueries } from '@/entities/auth/auth.queries';

const AccountContainer = () => {
  const {
    data: { me },
  } = useSuspenseQuery(AuthQueries.me());
  return (
    <div className="flex h-full flex-col px-5 pb-8">
      <div className="border-b border-b-gray-300 pb-8 pt-6">
        <MovePage to="/mypage/account/nickname" title="닉네임" subtitle={me?.nickname} />
        <MovePage to="/mypage/account/personal" title="개인정보" />
        <MovePage to="/mypage/account/password" title="비밀번호" />
      </div>
      <div className="flex flex-1 flex-col pt-8">
        <div className="pb-[22px]">
          <span className="text-sm text-gray-600">이메일 주소</span>
        </div>
        <div>
          <span className="text-gray-900">{me?.email}</span>
        </div>
        <div className="flex flex-1 flex-col justify-end">
          <div className="flex justify-center">
            <AccountManagement />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountContainer;
