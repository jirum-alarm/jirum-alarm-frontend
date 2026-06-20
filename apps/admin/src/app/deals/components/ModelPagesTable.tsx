'use client';

import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import {
  useGetModelPagesByAdmin,
  useSetModelPagePublishedByAdmin,
} from '@/hooks/graphql/modelPage';
import { dateFormatter } from '@/utils/date';

// 90일 넘게 새 딜이 없으면 stale 후보로 강조(검수자가 발행 전 freshness 판단).
const STALE_DAYS = 90;

const ModelPagesTable = () => {
  const [onlyDrafts, setOnlyDrafts] = useState(false);
  const { data, loading } = useGetModelPagesByAdmin({ onlyDrafts });
  const [setPublished, { loading: mutating }] = useSetModelPagePublishedByAdmin();

  const pages = data?.modelPagesByAdmin ?? [];

  const handleToggle = (id: number, slug: string, next: boolean) => () => {
    const verb = next ? '발행' : '발행 취소';
    if (!confirm(`"${slug}" 페이지를 ${verb}하시겠습니까?`)) return;
    setPublished({ variables: { id, isPublished: next } });
  };

  return (
    <div className="w-full rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex w-full items-center justify-between gap-2 p-2">
        <span className="text-sm text-bodydark2">
          {loading ? '불러오는 중…' : `${pages.length}개`}
          {onlyDrafts ? ' (초안만)' : ' (전체)'}
        </span>
        <label className="flex cursor-pointer select-none items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onlyDrafts}
            onChange={(e) => setOnlyDrafts(e.target.checked)}
          />
          초안(미발행)만 보기
        </label>
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                모델
              </th>
              <th className="min-w-[80px] px-4 py-4 text-center font-medium text-black dark:text-white">
                딜수
              </th>
              <th className="min-w-[110px] px-4 py-4 text-center font-medium text-black dark:text-white">
                최저가
              </th>
              <th className="min-w-[120px] px-4 py-4 text-center font-medium text-black dark:text-white">
                마지막 딜
              </th>
              <th className="min-w-[100px] px-4 py-4 text-center font-medium text-black dark:text-white">
                상태
              </th>
              <th className="min-w-[120px] px-4 py-4 text-center font-medium text-black dark:text-white">
                발행
              </th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => {
              const isStale =
                !!p.lastDealAt && dayjs().diff(dayjs(p.lastDealAt), 'day') > STALE_DAYS;
              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="border-b border-[#eee] px-4 py-4 dark:border-strokedark xl:pl-11">
                    <div className="flex items-center gap-3">
                      {p.heroImage ? (
                        <Image
                          src={p.heroImage}
                          alt=""
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded object-contain"
                          unoptimized
                        />
                      ) : (
                        <div className="bg-gray-100 h-10 w-10 rounded" />
                      )}
                      <div className="min-w-0">
                        {/* 미리보기(초안도 열림) — 발행 전 실제 모양 검수 */}
                        <Link
                          href={`/deals/preview/${encodeURIComponent(p.slug)}`}
                          className="block truncate text-black hover:underline dark:text-white"
                        >
                          {p.modelName}
                        </Link>
                        <div className="flex items-center gap-2">
                          {p.brand && (
                            <span className="truncate text-xs text-bodydark2">{p.brand}</span>
                          )}
                          {p.isPublished && (
                            <a
                              href={`https://jirum-alarm.com/deals/${encodeURIComponent(p.slug)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 text-xs text-primary hover:underline"
                            >
                              운영 ↗
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-4 text-center dark:border-strokedark">
                    {p.dealCount}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-4 text-center dark:border-strokedark">
                    {p.heroMinPrice != null ? `${p.heroMinPrice.toLocaleString()}원` : '-'}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-4 text-center dark:border-strokedark">
                    {p.lastDealAt ? (
                      <span className={isStale ? 'font-medium text-meta-1' : ''}>
                        {dateFormatter(p.lastDealAt)}
                        {isStale && ' ⚠'}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-4 text-center dark:border-strokedark">
                    {p.isPublished ? (
                      <span className="inline-flex rounded-full bg-success/10 px-2.5 py-0.5 text-sm font-medium text-success">
                        발행됨
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-warning/10 px-2.5 py-0.5 text-sm font-medium text-warning">
                        초안
                      </span>
                    )}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-4 text-center dark:border-strokedark">
                    <button
                      disabled={mutating}
                      onClick={handleToggle(p.id, p.slug, !p.isPublished)}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 ${
                        p.isPublished ? 'bg-meta-1' : 'bg-primary'
                      }`}
                    >
                      {p.isPublished ? '발행 취소' : '발행'}
                    </button>
                  </td>
                </tr>
              );
            })}
            {!loading && pages.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-bodydark2">
                  {onlyDrafts ? '검수 대기 중인 초안이 없습니다.' : '모델 페이지가 없습니다.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModelPagesTable;
