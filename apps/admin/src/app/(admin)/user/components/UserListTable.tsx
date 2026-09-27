'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useInView } from 'react-intersection-observer';

import { useGetUsersByAdmin } from '@/hooks/graphql/user';
import { dateFormatter } from '@/utils/date';

const GENDER_MAP: Record<string, string> = {
  MALE: '남',
  FEMALE: '여',
};

const UserListTable = () => {
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState<string | undefined>(undefined);
  const [, startTransition] = useTransition();

  const { data, loading, fetchMore } = useGetUsersByAdmin({
    keyword: searchKeyword,
  });
  const users = data?.usersByAdmin ?? [];

  const handleSearch = () => {
    setSearchKeyword(keyword || undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const { ref: viewRef } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (!inView || loading || users.length === 0) return;
      const searchAfter = users[users.length - 1]?.searchAfter;
      if (!searchAfter) return;
      startTransition(() => {
        fetchMore({
          variables: { keyword: searchKeyword, searchAfter },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;
            return {
              usersByAdmin: [...prev.usersByAdmin, ...fetchMoreResult.usersByAdmin],
            };
          },
        });
      });
    },
  });

  return (
    <>
      <div className="mb-6 rounded-lg border border-stroke bg-white px-5 py-4 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">
              검색어
            </label>
            <input
              type="text"
              placeholder="이메일 또는 닉네임으로 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          <button
            onClick={handleSearch}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white transition hover:bg-opacity-90"
          >
            검색
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="w-16 px-4 py-4 text-center text-sm font-medium text-bodydark2">ID</th>
              <th className="min-w-[200px] px-4 py-4 text-sm font-medium text-bodydark2">이메일</th>
              <th className="w-32 px-4 py-4 text-sm font-medium text-bodydark2">닉네임</th>
              <th className="w-20 px-4 py-4 text-center text-sm font-medium text-bodydark2">
                성별
              </th>
              <th className="w-24 px-4 py-4 text-center text-sm font-medium text-bodydark2">
                출생연도
              </th>
              <th className="w-28 px-4 py-4 text-center text-sm font-medium text-bodydark2">
                가입일
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-1 border-b border-stroke dark:border-strokedark dark:hover:bg-meta-4"
              >
                <td className="px-4 py-3 text-center text-sm text-black dark:text-white">
                  {user.id}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/user/${user.id}`}
                    className="text-sm text-black hover:text-primary dark:text-white"
                  >
                    {user.email}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-black dark:text-white">{user.nickname}</td>
                <td className="px-4 py-3 text-center text-sm text-bodydark2">
                  {user.gender ? (GENDER_MAP[user.gender] ?? user.gender) : '-'}
                </td>
                <td className="px-4 py-3 text-center text-sm text-bodydark2">
                  {user.birthYear ?? '-'}
                </td>
                <td className="px-4 py-3 text-center text-xs text-bodydark2">
                  {user.createdAt ? dateFormatter(user.createdAt) : '-'}
                </td>
              </tr>
            ))}

            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {!loading && users.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-bodydark2">검색 결과가 없습니다.</div>
        )}

        <div ref={viewRef} className="h-4" />
      </div>
    </>
  );
};

export default UserListTable;
