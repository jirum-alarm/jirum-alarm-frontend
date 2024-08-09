import { ArrowRight } from '@/components/common/icons';
import Link from '@/features/Link';
import { getMe } from '@/features/users/server/me';

const MyProfileSection = async () => {
  const {
    data: { me },
  } = await getMe();

  return (
    <div className="px-5">
      <div className="border-b-2 border-gray-600 py-8">
        <Link href={'/mypage/account'}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">{me.nickname}</h2>
              <span className="text-xs text-gray-400">{me.email}</span>
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
