'use client';

import { useAdsByAdmin } from '@/hooks/graphql/advertisement';

import AdForm from '../../../components/AdForm';

const AdCloneLoader = ({ adId }: { adId: string }) => {
  const { data, loading, error } = useAdsByAdmin();

  if (loading)
    return (
      <div className="flex h-60 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  if (error) return <div className="text-danger">오류: {error.message}</div>;

  const ad = (data?.adsByAdmin ?? []).find((item) => item.id === adId);
  if (!ad) return <div className="text-danger">광고 {adId} 를 찾을 수 없습니다.</div>;

  return (
    <AdForm
      mode="create"
      initial={{
        id: ad.id,
        internalId: `${ad.internalId}-copy`,
        slotType: ad.slotType,
        slotLocation: ad.slotLocation,
        slotPriority: ad.slotPriority,
        startAt: ad.startAt.slice(0, 16),
        endAt: ad.endAt.slice(0, 16),
        targetUrl: ad.targetUrl,
        displayTitle: ad.displayTitle,
        isActive: false,
        graphic: ad.graphic,
      }}
    />
  );
};

export default AdCloneLoader;
