'use client';

import Link from 'next/link';
import { useInView } from 'react-intersection-observer';

import { useGetKeywordMapGroups, useRemoveKeywordMapGroup } from '@/hooks/graphql/keywordMap';

const KeywordMapGroupsTable = () => {
  const { data, loading, fetchMore } = useGetKeywordMapGroups();
  const [removeGroup] = useRemoveKeywordMapGroup();

  const handleRemoveGroup = (id: number, name: string) => {
    return (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (confirm(`정말 "${name}" 그룹을 삭제하시겠습니까?`)) {
        removeGroup({
          variables: { id: Number(id) },
        });
      }
    };
  };

  const { ref: viewRef } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (!inView) return;
      const groups = data?.keywordMapGroupsByAdmin;
      const searchAfter = groups?.at(-1)?.searchAfter;
      if (!searchAfter) return;
      fetchMore({
        variables: { searchAfter },
        updateQuery: (prev, { fetchMoreResult }) => {
          return {
            keywordMapGroupsByAdmin: [
              ...prev.keywordMapGroupsByAdmin,
              ...fetchMoreResult.keywordMapGroupsByAdmin,
            ],
          };
        },
      });
    },
  });

  if (loading) {
    return (
      <div className="w-full rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="animate-pulse space-y-4 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-gray-200 h-10 rounded" />
          ))}
        </div>
      </div>
    );
  }

  const groups = data?.keywordMapGroupsByAdmin ?? [];

  return (
    <div className="w-full rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[200px] px-4 py-4 text-center font-medium text-black dark:text-white xl:pl-11">
                이름
              </th>
              <th className="min-w-[300px] px-4 py-4 text-center font-medium text-black dark:text-white">
                설명
              </th>
              <th className="min-w-[100px] px-4 py-4 text-center font-medium text-black dark:text-white">
                엔트리 수
              </th>
              <th className="px-4 py-4 text-center font-medium text-black dark:text-white">액션</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.id} className="cursor-pointer hover:bg-slate-50">
                <td className="border-b border-[#eee] pl-9 text-center dark:border-strokedark xl:pl-11">
                  <Link className="block h-full p-4" href={`/keyword-map/${group.id}`}>
                    <h5 className="font-medium text-black dark:text-white">{group.name}</h5>
                  </Link>
                </td>
                <td className="border-b border-[#eee] text-center dark:border-strokedark">
                  <Link className="block h-full p-4" href={`/keyword-map/${group.id}`}>
                    <span className="text-sm text-slate-500">{group.description || '-'}</span>
                  </Link>
                </td>
                <td className="border-b border-[#eee] text-center dark:border-strokedark">
                  <Link className="block h-full p-4" href={`/keyword-map/${group.id}`}>
                    <span className="font-bold text-green-500">{group.entryCount}</span>
                  </Link>
                </td>
                <td className="border-b border-[#eee] dark:border-strokedark">
                  <div className="flex items-center justify-center space-x-3.5">
                    <Link
                      className="rounded-md p-2 text-sm hover:bg-slate-200 hover:text-primary"
                      href={`/keyword-map/update/${group.id}`}
                    >
                      수정
                    </Link>
                    <button
                      className="rounded-md p-2 text-sm hover:bg-rose-100 hover:text-danger"
                      onClick={handleRemoveGroup(group.id, group.name)}
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div ref={viewRef} />
      </div>
    </div>
  );
};

export default KeywordMapGroupsTable;
