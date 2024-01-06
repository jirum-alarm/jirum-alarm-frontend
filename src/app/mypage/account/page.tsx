import BasicLayout from '@/components/layout/BasicLayout'
import React from 'react'
import MovePage from './components/MovePage'
import { getClient } from '@/lib/client'
import { User } from '@/types/user'
import { QueryMe } from '@/graphql/auth'
import { useLogout } from '@/hooks/useLogout'
import AccountManagement from './components/AccountManagement'

const AccountPage = async () => {
  const { data } = await getClient().query<{ me: User }>({ query: QueryMe })
  return (
    <BasicLayout hasBackButton title="가입 정보">
      <div className="h-full px-5 pb-8 flex flex-col">
        <div className="pt-6 pb-8 border-b border-b-gray-300">
          <MovePage to="/" title="닉네임 " subtitle={data.me.nickname} />
          <MovePage to="/" title="기본정보 " />
        </div>
        <div className="pt-8 flex-1 flex flex-col">
          <div className="pb-[22px]">
            <span className="text-sm text-gray-600">이메일 주소</span>
          </div>
          <div>
            <span className="text-gray-900">{data.me.email}</span>
          </div>
          <div className="flex-1 flex flex-col justify-end">
            <div className="flex justify-center">
              <AccountManagement />
            </div>
          </div>
        </div>
      </div>
    </BasicLayout>
  )
}

export default AccountPage
