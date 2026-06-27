'use client';

import { useAdsByAdmin } from '@/hooks/graphql/advertisement';

import AdForm from '../../components/AdForm';

/**
 * 단건 조회 API 없이 adsByAdmin 목록에서 id 로 찾아 폼에 채운다.
 * (광고 건수가 적어 목록 1회 조회로 충분 — 전용 단건 쿼리 미추가)
 */
const AdEditLoader = ({ adId }: { adId: string }) => {
  const { data, loading, error } = useAdsByAdmin();

  if (loading)
    return (
      <div className="flex h-60 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  if (error) return <div className="text-danger">오류: {error.message}</div>;

  const ad = (data?.adsByAdmin ?? []).find((a) => a.id === adId);
  if (!ad) return <div className="text-danger">광고 {adId} 를 찾을 수 없습니다.</div>;

  return (
    <AdForm
      mode="edit"
      initial={{
        id: ad.id,
        internalId: ad.internalId,
        slotType: ad.slotType,
        slotLocation: ad.slotLocation,
        slotPriority: ad.slotPriority,
        startAt: ad.startAt.slice(0, 16),
        endAt: ad.endAt.slice(0, 16),
        targetUrl: ad.targetUrl,
        displayTitle: ad.displayTitle,
        isActive: ad.isActive,
        graphic: ad.graphic,
      }}
    />
  );
};

export default AdEditLoader;
