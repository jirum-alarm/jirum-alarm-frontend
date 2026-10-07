'use client';

import Link from 'next/link';

import { useConfirm } from '@/components/Confirm';
import Panel from '@/components/Panel';
import { useGetKeywordMapGroups, useRemoveKeywordMapGroup } from '@/hooks/graphql/keywordMap';
import { useLoadMoreOnView } from '@/hooks/useLoadMoreOnView';

const KeywordMapGroupsTable = () => {
  const confirm = useConfirm();
  const { data, loading, fetchMore } = useGetKeywordMapGroups();
  const [removeGroup] = useRemoveKeywordMapGroup();

  const handleRemoveGroup = (id: string, name: string) => {
    return async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (await confirm({ message: `정말 "${name}" 그룹을 삭제하시겠습니까?`, danger: true })) {
        removeGroup({
          variables: { id: Number(id) },
        });
      }
    };
  };

  const viewRef = useLoadMoreOnView({ field: 'keywordMapGroupsByAdmin', data, loading, fetchMore });

  if (loading) {
    return (
      <Panel rounded="sm" className="w-full min-w-0 px-3 pb-2.5 pt-4 sm:px-7.5 sm:pt-6 xl:pb-1">
        <div className="animate-pulse space-y-4 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 rounded bg-gray-200" />
          ))}
        </div>
      </Panel>
    );
  }

  const groups = data?.keywordMapGroupsByAdmin ?? [];

  return (
    <Panel rounded="sm" className="w-full min-w-0 px-3 pb-2.5 pt-4 sm:px-7.5 sm:pt-6 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[120px] px-4 py-4 text-center font-medium text-black dark:text-white sm:min-w-[200px] xl:pl-11">
                이름
              </th>
              <th className="min-w-[180px] px-4 py-4 text-center font-medium text-black dark:text-white sm:min-w-[300px]">
                설명
              </th>
              <th className="min-w-[80px] whitespace-nowrap px-4 py-4 text-center font-medium text-black dark:text-white sm:min-w-[100px]">
                엔트리 수
              </th>
              <th className="px-4 py-4 text-center font-medium text-black dark:text-white">액션</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.id} className="cursor-pointer hover:bg-slate-50">
                <td className="border-b border-[#eee] text-center dark:border-strokedark sm:pl-9 xl:pl-11">
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
                  <div className="flex items-center justify-center space-x-1 whitespace-nowrap px-2 sm:space-x-3.5 sm:px-0">
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
    </Panel>
  );
};

export default KeywordMapGroupsTable;
