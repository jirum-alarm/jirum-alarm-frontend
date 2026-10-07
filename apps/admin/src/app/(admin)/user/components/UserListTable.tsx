'use client';

import Link from 'next/link';
import { useState } from 'react';

import Panel from '@/components/Panel';
import Spinner from '@/components/Spinner';
import { useGetUsersByAdmin } from '@/hooks/graphql/user';
import { useLoadMoreOnView } from '@/hooks/useLoadMoreOnView';
import { dateFormatter } from '@/utils/date';

const GENDER_MAP: Record<string, string> = {
  MALE: '남',
  FEMALE: '여',
};

const UserListTable = () => {
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState<string | undefined>(undefined);

  const { data, loading, fetchMore } = useGetUsersByAdmin({
    keyword: searchKeyword,
  });
  const users = data?.usersByAdmin ?? [];

  const handleSearch = () => {
    setSearchKeyword(keyword || undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 한글 조합 중 Enter 는 글자 확정용 — 반쯤 조합된 글자로 실행하지 않는다
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSearch();
    }
  };

  const viewRef = useLoadMoreOnView({ field: 'usersByAdmin', data, loading, fetchMore });

  return (
    <>
      <Panel className="mb-4 px-4 py-4 sm:mb-6 sm:px-7.5">
        <div className="flex items-end gap-2 sm:gap-4">
          <div className="min-w-0 flex-1">
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
            className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-opacity-90 sm:px-6"
          >
            검색
          </button>
        </div>
      </Panel>

      <Panel>
        <div className="max-w-full overflow-x-auto">
          <table className="table-cards w-full table-auto md:whitespace-nowrap">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="w-16 px-4 py-4 text-center text-sm font-medium text-bodydark2">
                  ID
                </th>
                <th className="min-w-[200px] px-4 py-4 text-sm font-medium text-bodydark2">
                  이메일
                </th>
                <th className="w-32 px-4 py-4 text-sm font-medium text-bodydark2">닉네임</th>
                <th className="hidden w-20 px-4 py-4 text-center text-sm font-medium text-bodydark2 md:table-cell">
                  성별
                </th>
                <th className="hidden w-24 px-4 py-4 text-center text-sm font-medium text-bodydark2 md:table-cell">
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
                  <td
                    data-label="ID"
                    className="px-4 py-3 text-center text-sm text-black dark:text-white"
                  >
                    {user.id}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/user/${user.id}`}
                      className="block py-1 text-sm font-medium text-black hover:text-primary dark:text-white md:-my-3 md:py-3 md:font-normal"
                    >
                      {user.email}
                    </Link>
                  </td>
                  <td data-label="닉네임" className="px-4 py-3 text-sm text-black dark:text-white">
                    {user.nickname}
                  </td>
                  <td
                    data-label="성별"
                    className="hidden px-4 py-3 text-center text-sm text-bodydark2 md:table-cell"
                  >
                    {user.gender ? (GENDER_MAP[user.gender] ?? user.gender) : '-'}
                  </td>
                  <td
                    data-label="출생연도"
                    className="hidden px-4 py-3 text-center text-sm text-bodydark2 md:table-cell"
                  >
                    {user.birthYear ?? '-'}
                  </td>
                  <td data-label="가입일" className="px-4 py-3 text-center text-xs text-bodydark2">
                    {user.createdAt ? dateFormatter(user.createdAt) : '-'}
                  </td>
                </tr>
              ))}

              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <Spinner size="lg" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && users.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-bodydark2">검색 결과가 없습니다.</div>
        )}

        <div ref={viewRef} className="h-4" />
      </Panel>
    </>
  );
};

export default UserListTable;
