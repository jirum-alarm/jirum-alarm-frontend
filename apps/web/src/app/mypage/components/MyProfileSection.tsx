'use client';
import { ArrowRight } from '@/components/common/icons';
import { QueryMe } from '@/graphql/auth';
import { User } from '@/types/user';
import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr';
import Link from '@/features/Link';

interface Props {
  me: User;
}

const MyProfileSection = ({ me }: Props) => {
  // const { data } = useQuery<{ me: User }>(QueryMe);

  return (
    <div className="px-5">
      <div className="border-b-2 border-gray-600 py-8">
        <Link href={'/mypage/account'}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">{me?.nickname}</h2>
              <span className="text-xs text-gray-400">{me?.email}</span>
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
