'use client';

import Link from 'next/link';

import { useGetUserByAdmin } from '@/hooks/graphql/user';
import { dateFormatter } from '@/utils/date';

const GENDER_MAP: Record<string, string> = {
  MALE: '남성',
  FEMALE: '여성',
};

const PROVIDER_MAP: Record<string, string> = {
  GOOGLE: 'Google',
  KAKAO: '카카오',
  NAVER: '네이버',
  APPLE: 'Apple',
};

const UserDetail = ({ userId }: { userId: string }) => {
  const { data, loading } = useGetUserByAdmin({ id: Number(userId) });
  const user = data?.userByAdmin;

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-60 items-center justify-center text-bodydark2">
        사용자를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 기본 정보 */}
      <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">기본 정보</h3>
        <div className="flex flex-col gap-3">
          <InfoRow label="ID" value={String(user.id)} />
          <InfoRow label="이메일" value={user.email} />
          <InfoRow label="닉네임" value={user.nickname} />
          <InfoRow
            label="성별"
            value={user.gender ? (GENDER_MAP[user.gender] ?? user.gender) : '-'}
          />
          <InfoRow label="출생연도" value={user.birthYear ? String(user.birthYear) : '-'} />
          <InfoRow label="가입일" value={user.createdAt ? dateFormatter(user.createdAt) : '-'} />
        </div>
      </div>

      {/* 소셜 로그인 */}
      <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">연동된 소셜 계정</h3>
        {user.linkedSocialProviders && user.linkedSocialProviders.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {user.linkedSocialProviders.map((provider) => (
              <span
                key={provider}
                className="rounded-full bg-primary bg-opacity-10 px-4 py-1.5 text-sm font-medium text-primary"
              >
                {PROVIDER_MAP[provider] ?? provider}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-bodydark2">연동된 소셜 계정이 없습니다.</p>
        )}
      </div>

      {/* 관심 카테고리 */}
      <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">관심 카테고리</h3>
        {user.favoriteCategories && user.favoriteCategories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {user.favoriteCategories.map((catId) => (
              <span
                key={catId}
                className="rounded-full bg-bodydark2 bg-opacity-10 px-4 py-1.5 text-sm font-medium text-bodydark2"
              >
                카테고리 {catId}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-bodydark2">설정된 관심 카테고리가 없습니다.</p>
        )}
      </div>

      <div>
        <Link
          href="/user"
          className="hover:bg-gray-1 rounded-lg border border-stroke px-6 py-2 text-sm font-medium text-bodydark2 transition dark:border-strokedark dark:hover:bg-meta-4"
        >
          목록으로
        </Link>
      </div>
    </div>
  );
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <span className="w-20 shrink-0 text-sm font-medium text-bodydark2">{label}</span>
      <span className="text-sm text-black dark:text-white">{value}</span>
    </div>
  );
}

export default UserDetail;
