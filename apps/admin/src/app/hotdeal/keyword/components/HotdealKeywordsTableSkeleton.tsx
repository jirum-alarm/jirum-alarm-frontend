const HotdealKeywordsTableSkeleton = () => {
  return (
    <div className="w-full rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-2 text-left dark:bg-meta-4">
            <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
              키워드
            </th>
            <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
              가중치
            </th>
            <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">유형</th>
            <th className="px-4 py-4 font-medium text-black dark:text-white">액션</th>
          </tr>
        </thead>
        <tbody className="animate-pulse">
          {Array.from({ length: 5 }, (v, i) => i).map((v, i) => (
            <tr key={v}>
              <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                <div className=" dark:bg-gray-700 mb-4 h-2.5 w-12 rounded-full bg-slate-200"></div>
              </td>
              <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                <div className=" dark:bg-gray-700 mb-4 h-2.5 w-12 rounded-full bg-slate-200"></div>
              </td>
              <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                <div className=" dark:bg-gray-700 mb-4 h-2.5 w-12 rounded-full bg-slate-200"></div>
              </td>
              <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                <div className=" dark:bg-gray-700 mb-4 h-2.5 w-12 rounded-full bg-slate-200"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HotdealKeywordsTableSkeleton;
