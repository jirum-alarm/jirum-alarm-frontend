'use client';
import { ArrowRight } from '@/components/common/icons';
import { QueryMe } from '@/graphql/auth';
import { User } from '@/types/user';
import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr';
import Link from 'next/link';

const MyProfileSection = () => {
  const { data } = useQuery<{ me: User }>(QueryMe);

  return (
    <div className="px-5">
      <div className="border-b-2 border-gray-600 py-8">
        <Link href={'/mypage/account'}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">{data?.me.nickname}</h2>
              <span className="text-xs text-gray-400">{data?.me.email}</span>
            </div>
            <div>
              <ArrowRight />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default MyProfileSection;
