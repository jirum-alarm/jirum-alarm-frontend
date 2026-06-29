'use client';

import Link from 'next/link';

import { useAdReport, useAdsByAdmin, useSetAdActive } from '@/hooks/graphql/advertisement';

// 전체 누적 집계용 넉넉한 기간. ponytail: 광고 수가 적어 풀스캔 OK,
// 느려지면 광고 startAt 기준으로 좁히는 게 업그레이드 경로.
const REPORT_FROM = '2020-01-01T00:00:00.000Z';
const REPORT_TO = '2099-12-31T23:59:59.000Z';

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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  if (error)
    return (
      <div className="flex h-60 items-center justify-center text-danger">오류: {error.message}</div>
    );

  return (
    <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex justify-end p-4">
        <Link
          href="/advertisement/register"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
        >
          광고 등록
        </Link>
      </div>
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-2 text-left dark:bg-meta-4">
            <th className="px-4 py-3 text-sm font-medium text-bodydark2">ID</th>
            <th className="px-4 py-3 text-sm font-medium text-bodydark2">internalId</th>
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
                <td className="px-4 py-3 text-sm">{ad.id}</td>
                <td className="px-4 py-3 text-sm">{ad.internalId}</td>
                <td className="px-4 py-3 text-sm">{ad.slotType}</td>
                <td className="px-4 py-3 text-xs">{ad.slotLocation.join(', ')}</td>
                <td className="px-4 py-3 text-xs">
                  {ad.startAt.slice(0, 10)} ~ {ad.endAt.slice(0, 10)}
                </td>
                <td className="px-4 py-3 text-sm">{ad.slotPriority}</td>
                <td className="px-4 py-3 text-sm">{(report?.impressions ?? 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm">{(report?.clicks ?? 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm">
                  {report && report.impressions > 0 ? `${(report.ctr * 100).toFixed(2)}%` : '-'}
                </td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() =>
                      setActive({ variables: { id: Number(ad.id), isActive: !ad.isActive } })
                    }
                    className={ad.isActive ? 'text-success' : 'text-danger'}
                  >
                    {ad.isActive ? '활성' : '비활성'}
                  </button>
                </td>
                <td className="px-4 py-3 text-sm">
                  <Link href={`/advertisement/${ad.id}`} className="text-primary hover:underline">
                    수정
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdListTable;
