'use client';
import Switcher from '@/components/Switchers/SwitcherOne';
import { HotDealKeywordTypeMap } from '@/constants/hotdeal';
import { useGetHotDealKeywords, useRemoveHotDealKeyword } from '@/hooks/graphql/keyword';
import { HotDealKeywordType } from '@/types/keyword';
import { getParticle } from '@/utils/text';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const HotdealKeywordsTable = () => {
  const [keywordType, setKeywordType] = useState(HotDealKeywordType.POSITIVE);
  const router = useRouter();
  const { data } = useGetHotDealKeywords({
    variables: {
      type: keywordType,
    },
  });
  const [removeHotdealKeyword] = useRemoveHotDealKeyword();
  const moveKeywordDetail = (keywordId: number) => {
    router.push(`/hotdeal/keyword/${keywordId}`);
  };
  const handleRemoveHotdealKeyword = (id: number, keyword: string) => {
    return (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (confirm(`정말 "${keyword}"${getParticle(keyword)} 삭제하시겠습니까?`)) {
        removeHotdealKeyword({
          variables: {
            id: Number(id),
          },
        });
      }
    };
  };
  const handleMoveKeywordUpdate = (id: number) => {
    return (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      router.push(`/hotdeal/keyword/update/${id}`);
    };
  };
  const handleChangeHotdealOption = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const type = isChecked ? HotDealKeywordType.NEGATIVE : HotDealKeywordType.POSITIVE;
    setKeywordType(type);
  };
  return (
    <div className="w-full rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex w-full items-center justify-end gap-2 p-2">
        <span>긍정</span>
        <Switcher onChange={handleChangeHotdealOption} />
        <span>부정</span>
      </div>
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                키워드
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                가중치
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                유형
              </th>
              <th className="px-4 py-4 text-center font-medium text-black dark:text-white">액션</th>
            </tr>
          </thead>
          <tbody>
            {data.hotDealKeywordsByAdmin.map((hotdeal, key) => (
              <tr
                key={hotdeal.id}
                className="cursor-pointer hover:bg-slate-50"
                onClick={() => moveKeywordDetail(hotdeal.id)}
              >
                <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">{hotdeal.keyword}</h5>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">{hotdeal.weight}</p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p
                    className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                      hotdeal.type === HotDealKeywordType.POSITIVE
                        ? 'bg-success text-success'
                        : hotdeal.type === HotDealKeywordType.NEGATIVE
                          ? 'bg-danger text-danger'
                          : ''
                    }`}
                  >
                    {HotDealKeywordTypeMap[hotdeal.type]}
                  </p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <div className="flex items-center justify-center space-x-3.5">
                    <button
                      className="rounded-md p-2 text-sm hover:bg-slate-200 hover:text-primary"
                      onClick={handleMoveKeywordUpdate(hotdeal.id)}
                    >
                      수정
                    </button>
                    <button
                      className="rounded-md p-2 text-sm hover:bg-rose-100 hover:text-danger"
                      onClick={handleRemoveHotdealKeyword(hotdeal.id, hotdeal.keyword)}
                    >
                      삭제
                    </button>
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

export default HotdealKeywordsTable;
