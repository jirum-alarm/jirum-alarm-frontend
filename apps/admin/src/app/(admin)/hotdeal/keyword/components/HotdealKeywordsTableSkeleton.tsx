import Panel from '@/components/Panel';

const HotdealKeywordsTableSkeleton = () => {
  return (
    <Panel rounded="sm" className="w-full min-w-0 px-3 pb-2.5 pt-4 sm:px-7.5 sm:pt-6 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[110px] px-4 py-4 font-medium text-black dark:text-white sm:min-w-[220px] xl:pl-11">
                키워드
              </th>
              <th className="hidden min-w-[150px] px-4 py-4 font-medium text-black dark:text-white md:table-cell">
                업데이트
              </th>
              <th className="min-w-[80px] whitespace-nowrap px-4 py-4 font-medium text-black dark:text-white sm:min-w-[150px]">
                가중치
              </th>
              <th className="min-w-[90px] px-4 py-4 font-medium text-black dark:text-white sm:min-w-[120px]">
                유형
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">액션</th>
            </tr>
          </thead>
          <tbody className="animate-pulse">
            {Array.from({ length: 5 }, (v, i) => i).map((v, i) => (
              <tr key={v}>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark sm:pl-9 xl:pl-11">
                  <div className="mb-4 h-2.5 w-12 rounded-full bg-slate-200 dark:bg-gray-700"></div>
                </td>
                <td className="hidden border-b border-[#eee] px-4 py-5 dark:border-strokedark md:table-cell">
                  <div className="mb-4 h-2.5 w-12 rounded-full bg-slate-200 dark:bg-gray-700"></div>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <div className="mb-4 h-2.5 w-12 rounded-full bg-slate-200 dark:bg-gray-700"></div>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <div className="mb-4 h-2.5 w-12 rounded-full bg-slate-200 dark:bg-gray-700"></div>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <div className="mb-4 h-2.5 w-12 rounded-full bg-slate-200 dark:bg-gray-700"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};

export default HotdealKeywordsTableSkeleton;
