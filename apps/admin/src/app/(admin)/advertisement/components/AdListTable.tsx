'use client';

import Link from 'next/link';

import Panel from '@/components/Panel';
import Spinner from '@/components/Spinner';
import { useAdReport, useAdsByAdmin, useSetAdActive } from '@/hooks/graphql/advertisement';
import { AD_SLOT_LOCATION_LABEL, AD_SLOT_TYPE_LABEL, labelOf } from '@/lib/labels';

// 전체 누적 집계용 넉넉한 기간. ponytail: 광고 수가 적어 풀스캔 OK,
// 느려지면 광고 startAt 기준으로 좁히는 게 업그레이드 경로.
const REPORT_FROM = '2020-01-01T00:00:00.000Z';
const REPORT_TO = '2099-12-31T23:59:59.000Z';
const actionButtonClass =
  'inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md px-2.5 text-xs font-semibold transition md:h-8';

const AdListTable = () => {
  const { data, loading, error } = useAdsByAdmin();
  const { data: reportData } = useAdReport({ from: REPORT_FROM, to: REPORT_TO });
  const [setActive] = useSetAdActive();
  const ads = data?.adsByAdmin ?? [];

  // creativeId → {impressions, clicks, ctr}
  const reportByCreative = new Map(
    (reportData?.adReport ?? []).map((r) => [String(r.creativeId), r]),
  );

  if (loading)
    return (
      <div className="flex h-60 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  if (error)
    return (
      <div className="flex h-60 items-center justify-center text-danger">오류: {error.message}</div>
    );

  return (
    <Panel>
      <div className="flex justify-end p-3 sm:p-4">
        <Link
          href="/advertisement/register"
          className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90"
        >
          광고 등록
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="table-cards w-full table-auto md:whitespace-nowrap lg:whitespace-normal">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="px-4 py-3 text-sm font-medium text-bodydark2">ID</th>
              <th className="px-4 py-3 text-sm font-medium text-bodydark2">이름</th>
              <th className="px-4 py-3 text-sm font-medium text-bodydark2">타입</th>
              <th className="px-4 py-3 text-sm font-medium text-bodydark2">위치</th>
              <th className="px-4 py-3 text-sm font-medium text-bodydark2">기간</th>
              <th className="px-4 py-3 text-sm font-medium text-bodydark2">우선순위</th>
              <th className="px-4 py-3 text-sm font-medium text-bodydark2">노출</th>
              <th className="px-4 py-3 text-sm font-medium text-bodydark2">클릭</th>
              <th className="px-4 py-3 text-sm font-medium text-bodydark2">CTR</th>
              <th className="px-4 py-3 text-sm font-medium text-bodydark2">상태</th>
              <th className="px-4 py-3 text-sm font-medium text-bodydark2"></th>
            </tr>
          </thead>
          <tbody>
            {ads.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-sm text-bodydark2">
                  등록된 광고가 없습니다
                </td>
              </tr>
            )}
            {ads.map((ad) => {
              const report = reportByCreative.get(ad.id);
              return (
                <tr key={ad.id} className="border-b border-stroke dark:border-strokedark">
                  <td data-label="ID" className="hidden px-4 py-3 text-sm md:table-cell">
                    {ad.id}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="font-semibold text-black dark:text-white">
                      {ad.internalId}
                    </span>
                    <span className="ml-2 text-xs text-bodydark2 md:hidden">#{ad.id}</span>
                  </td>
                  <td data-label="타입" className="px-4 py-3 text-sm">
                    {labelOf(AD_SLOT_TYPE_LABEL, ad.slotType)}
                  </td>
                  <td data-label="위치" className="px-4 py-3 text-xs">
                    {ad.slotLocation.map((l) => labelOf(AD_SLOT_LOCATION_LABEL, l)).join(', ')}
                  </td>
                  <td data-label="기간" className="px-4 py-3 text-xs">
                    {ad.startAt.slice(0, 10)} ~ {ad.endAt.slice(0, 10)}
                  </td>
                  <td data-label="우선순위" className="px-4 py-3 text-sm">
                    {ad.slotPriority}
                  </td>
                  <td data-label="노출" className="hidden px-4 py-3 text-sm md:table-cell">
                    {(report?.impressions ?? 0).toLocaleString()}
                  </td>
                  <td data-label="클릭" className="hidden px-4 py-3 text-sm md:table-cell">
                    {(report?.clicks ?? 0).toLocaleString()}
                  </td>
                  <td data-label="CTR" className="hidden px-4 py-3 text-sm md:table-cell">
                    {report && report.impressions > 0 ? `${(report.ctr * 100).toFixed(2)}%` : '-'}
                  </td>
                  <td data-label="성과" className="px-4 py-3 text-sm md:hidden">
                    노출 {(report?.impressions ?? 0).toLocaleString()} · 클릭{' '}
                    {(report?.clicks ?? 0).toLocaleString()}
                    {report && report.impressions > 0 && ` · ${(report.ctr * 100).toFixed(2)}%`}
                  </td>
                  <td data-label="상태" className="px-4 py-3 text-sm">
                    <button
                      type="button"
                      onClick={() =>
                        setActive({ variables: { id: Number(ad.id), isActive: !ad.isActive } })
                      }
                      className={`${actionButtonClass} ${
                        ad.isActive
                          ? 'bg-success text-white hover:bg-success/90'
                          : 'bg-danger text-white hover:bg-danger/90'
                      }`}
                    >
                      {ad.isActive ? '활성' : '비활성'}
                    </button>
                  </td>
                  <td data-label="actions" className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/advertisement/${ad.id}`}
                        className={`${actionButtonClass} bg-primary text-white hover:bg-primary/90`}
                      >
                        수정
                      </Link>
                      <Link
                        href={`/advertisement/clone/${ad.id}`}
                        className={`${actionButtonClass} bg-gray-2 text-black hover:bg-stroke/90 dark:bg-meta-4 dark:text-white`}
                      >
                        복제
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};

export default AdListTable;
