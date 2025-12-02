const VerificationTableSkeleton = () => {
  return (
    <div className="w-full rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[80px] px-4 py-4 text-center font-medium text-black dark:text-white">
                ID
              </th>
              <th className="min-w-[140px] px-4 py-4 text-center font-medium text-black dark:text-white">
                Product ID
              </th>
              <th className="px-4 py-4 text-center font-medium text-black dark:text-white">
                상품명
              </th>
              <th className="px-4 py-4 text-center font-medium text-black dark:text-white">
                다나와 상품명
              </th>
              <th className="min-w-[120px] px-4 py-4 text-center font-medium text-black dark:text-white">
                검증 상태
              </th>
              <th className="min-w-[220px] px-4 py-4 text-center font-medium text-black dark:text-white">
                검증 정보
              </th>
              <th className="min-w-[160px] px-4 py-4 text-center font-medium text-black dark:text-white">
                액션
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index}>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <div className="bg-gray-200 dark:bg-gray-700 h-4 w-12 animate-pulse rounded" />
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <div className="bg-gray-200 dark:bg-gray-700 h-4 w-16 animate-pulse rounded" />
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <div className="bg-gray-200 dark:bg-gray-700 h-4 w-40 animate-pulse rounded" />
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <div className="bg-gray-200 dark:bg-gray-700 h-4 w-48 animate-pulse rounded" />
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <div className="bg-gray-200 dark:bg-gray-700 mx-auto h-4 w-24 animate-pulse rounded" />
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <div className="bg-gray-200 dark:bg-gray-700 mx-auto h-10 w-40 animate-pulse rounded" />
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <div className="flex justify-center gap-3">
                    <div className="bg-gray-200 dark:bg-gray-700 h-8 w-16 animate-pulse rounded" />
                    <div className="bg-gray-200 dark:bg-gray-700 h-8 w-16 animate-pulse rounded" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VerificationTableSkeleton;
