'use client';
import BasicLayout from '@/components/layout/BasicLayout';
import React from 'react';
import MovePage from './components/MovePage';
import { User } from '@/types/user';
import { QueryMe } from '@/graphql/auth';
import AccountManagement from './components/AccountManagement';
import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr';

const AccountPage = () => {
  const { data } = useQuery<{ me: Omit<User, 'favoriteCategories' | 'linkedSocialProviders'> }>(
    QueryMe,
  );
  return (
    <BasicLayout hasBackButton title="가입 정보">
      <div className="flex h-full flex-col px-5 pb-8">
        <div className="border-b border-b-gray-300 pb-8 pt-6">
          <MovePage to="/mypage/account/nickname" title="닉네임" subtitle={data?.me.nickname} />
          <MovePage to="/mypage/account/personal" title="개인정보" />
          <MovePage to="/mypage/account/password" title="비밀번호" />
        </div>
        <div className="flex flex-1 flex-col pt-8">
          <div className="pb-[22px]">
            <span className="text-sm text-gray-600">이메일 주소</span>
          </div>
          <div>
            <span className="text-gray-900">{data?.me.email}</span>
          </div>
          <div className="flex flex-1 flex-col justify-end">
            <div className="flex justify-center">
              <AccountManagement />
            </div>
          </div>
        </div>
      </div>
    </BasicLayout>
  );
};

export default AccountPage;
