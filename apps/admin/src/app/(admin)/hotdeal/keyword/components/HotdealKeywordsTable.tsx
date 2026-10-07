'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { useConfirm } from '@/components/Confirm';
import Panel from '@/components/Panel';
import Switcher from '@/components/Switchers/SwitcherOne';
import { HotDealKeywordTypeMap } from '@/constants/hotdeal';
import { useGetHotDealKeywords, useRemoveHotDealKeyword } from '@/hooks/graphql/keyword';
import { useLoadMoreOnView } from '@/hooks/useLoadMoreOnView';
import { HotDealKeywordType } from '@/types/keyword';
import { dateFormatter } from '@/utils/date';
import { getParticle } from '@/utils/text';

const HotdealKeywordsTable = () => {
  const confirm = useConfirm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const keywordType = (searchParams.get('keywordType') ??
    HotDealKeywordType.POSITIVE) as HotDealKeywordType;
  const { data, fetchMore } = useGetHotDealKeywords({
    variables: {
      type: keywordType,
    },
  });

  const [removeHotdealKeyword] = useRemoveHotDealKeyword(keywordType);

  const handleRemoveHotdealKeyword = (id: string, keyword: string) => {
    return async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (
        await confirm({
          message: `정말 "${keyword}"${getParticle(keyword)} 삭제하시겠습니까?`,
          danger: true,
        })
      ) {
        removeHotdealKeyword({
          variables: {
            id: Number(id),
          },
        });
      }
    };
  };

  const handleChangeHotdealOption = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const type = isChecked ? HotDealKeywordType.NEGATIVE : HotDealKeywordType.POSITIVE;
    router.replace(`/hotdeal/keyword?keywordType=${type}`);
  };

  // useSuspenseQuery 라 로딩 상태가 없다
  const viewRef = useLoadMoreOnView({
    field: 'hotDealKeywordsByAdmin',
    data,
    loading: false,
    fetchMore,
  });

  return (
    <Panel rounded="sm" className="w-full min-w-0 px-3 pb-2.5 pt-4 sm:px-7.5 sm:pt-6 xl:pb-1">
      <div className="flex w-full items-center justify-end gap-2 p-2">
        <span>긍정</span>
        <Switcher
          onChange={handleChangeHotdealOption}
          isEnabled={keywordType === HotDealKeywordType.NEGATIVE}
        />
        <span>부정</span>
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[110px] px-4 py-4 text-center font-medium text-black dark:text-white sm:min-w-[150px] xl:pl-11">
                키워드
              </th>
              <th className="hidden min-w-[100px] px-4 py-4 text-center font-medium text-black dark:text-white md:table-cell">
                업데이트
              </th>
              <th className="min-w-[80px] whitespace-nowrap px-4 py-4 text-center font-medium text-black dark:text-white sm:min-w-[100px]">
                유의어
              </th>
              <th className="min-w-[80px] whitespace-nowrap px-4 py-4 text-center font-medium text-black dark:text-white sm:min-w-[100px]">
                가중치
              </th>
              <th className="min-w-[90px] px-4 py-4 text-center font-medium text-black dark:text-white sm:min-w-[120px]">
                유형
              </th>
              <th className="px-4 py-4 text-center font-medium text-black dark:text-white">액션</th>
            </tr>
          </thead>
          <tbody>
            {data.hotDealKeywordsByAdmin.map((hotdeal, key) => (
              <tr key={hotdeal.id} className="cursor-pointer hover:bg-slate-50">
                <td className="border-b border-[#eee] text-center dark:border-strokedark sm:pl-9 xl:pl-11">
                  <Link className="block h-full p-4" href={`/hotdeal/keyword/${hotdeal.id}`}>
                    <h5 className="font-medium text-black dark:text-white">
                      <span>{hotdeal.keyword}</span>
                    </h5>
                  </Link>
                </td>
                <td className="hidden border-b border-[#eee] text-center dark:border-strokedark md:table-cell">
                  <Link className="block h-full p-4" href={`/hotdeal/keyword/${hotdeal.id}`}>
                    <span className="text-xs text-slate-400">
                      {dateFormatter(hotdeal.lastUpdatedAt)}
                    </span>
                  </Link>
                </td>
                <td className="border-b border-[#eee] text-center dark:border-strokedark">
                  <Link className="block h-full p-4" href={`/hotdeal/keyword/${hotdeal.id}`}>
                    <p className="text-black dark:text-white">
                      <span className="font-bold text-green-500">{hotdeal.synonymCount}</span>
                      <span>{`/`}</span>
                      <span className="font-bold text-rose-500">{hotdeal.excludeKeywordCount}</span>
                    </p>
                  </Link>
                </td>
                <td className="border-b border-[#eee] text-center dark:border-strokedark">
                  <Link className="block h-full p-4" href={`/hotdeal/keyword/${hotdeal.id}`}>
                    <p className="text-black dark:text-white">{hotdeal.weight}</p>
                  </Link>
                </td>
                <td className="border-b border-[#eee] dark:border-strokedark">
                  <Link className="block h-full p-4" href={`/hotdeal/keyword/${hotdeal.id}`}>
                    <div className="flex justify-center">
                      <p
                        className={`inline-flex whitespace-nowrap rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                          hotdeal.type === HotDealKeywordType.POSITIVE
                            ? 'bg-success text-success'
                            : hotdeal.type === HotDealKeywordType.NEGATIVE
                              ? 'bg-danger text-danger'
                              : ''
                        }`}
                      >
                        {HotDealKeywordTypeMap[hotdeal.type]}
                      </p>
                    </div>
                  </Link>
                </td>
                <td className="border-b border-[#eee] dark:border-strokedark">
                  <div className="flex items-center justify-center space-x-1 whitespace-nowrap px-2 sm:space-x-3.5 sm:px-0">
                    <Link
                      className="rounded-md p-2 text-sm hover:bg-slate-200 hover:text-primary"
                      href={`/hotdeal/keyword/update/${hotdeal.id}`}
                    >
                      수정
                    </Link>
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
        <div ref={viewRef} />
      </div>
    </Panel>
  );
};

export default HotdealKeywordsTable;
