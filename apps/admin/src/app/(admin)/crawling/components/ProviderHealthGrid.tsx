'use client';

import dayjs from 'dayjs';

import { useProviderHealthStatus } from '@/hooks/graphql/stats';
import { ProviderHealthOutput, ProviderType } from '@/types/stats';

// provider 스케줄에 따라 "정상이라면 N분 안에는 들어와야 함" 임계치.
// values.yaml의 cronjob 스케줄에서 가장 긴 간격(ruliweb=30분)에 여유 1h를 더해 정함.
const STALE_THRESHOLD_MIN = 90;
const CRITICAL_THRESHOLD_MIN = 60 * 6;

type HealthLevel = 'healthy' | 'stale' | 'critical' | 'dead';

const getHealthLevel = (provider: ProviderHealthOutput): HealthLevel => {
  if (provider.minutesSinceLatest == null) return 'dead';
  if (provider.minutesSinceLatest >= CRITICAL_THRESHOLD_MIN) return 'critical';
  if (provider.minutesSinceLatest >= STALE_THRESHOLD_MIN) return 'stale';
  return 'healthy';
};

const levelStyles: Record<HealthLevel, { card: string; dot: string; label: string }> = {
  healthy: {
    card: 'border-l-4 border-l-meta-3',
    dot: 'bg-meta-3',
    label: '정상',
  },
  stale: {
    card: 'border-l-4 border-l-warning',
    dot: 'bg-warning',
    label: '지연',
  },
  critical: {
    card: 'border-l-4 border-l-danger',
    dot: 'bg-danger',
    label: '심각',
  },
  dead: {
    card: 'border-l-4 border-l-bodydark2',
    dot: 'bg-bodydark2',
    label: '7일 무수집',
  },
};

const formatMinutes = (minutes?: number | null) => {
  if (minutes == null) return '7일 이상';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
};

const ProviderHealthGrid = () => {
  const { data, loading, error } = useProviderHealthStatus({
    providerType: ProviderType.COMMUNITY,
  });

  if (loading && !data) {
    return (
      <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
          Provider 상태 (커뮤니티)
        </h3>
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
          Provider 상태 (커뮤니티)
        </h3>
        <p className="text-sm text-danger">에러: {error.message}</p>
      </div>
    );
  }

  const providers = [...(data?.providerHealthStatus ?? [])].sort((a, b) => {
    const levelOrder: Record<HealthLevel, number> = {
      dead: 0,
      critical: 1,
      stale: 2,
      healthy: 3,
    };
    const diff = levelOrder[getHealthLevel(a)] - levelOrder[getHealthLevel(b)];
    if (diff !== 0) return diff;
    return b.last24hCount - a.last24hCount;
  });

  return (
    <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-black dark:text-white">
          Provider 상태 (커뮤니티)
        </h3>
        <span className="text-xs text-bodydark2">60초마다 자동 갱신</span>
      </div>

      {providers.length === 0 ? (
        <p className="py-8 text-center text-bodydark2">provider 정보가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {providers.map((provider) => {
            const level = getHealthLevel(provider);
            const styles = levelStyles[level];
            return (
              <div
                key={provider.providerId}
                className={`rounded border border-stroke bg-white p-4 dark:border-strokedark dark:bg-boxdark ${styles.card}`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-base font-semibold text-black dark:text-white">
                    {provider.providerName}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-bodydark2">
                    <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
                    {styles.label}
                  </span>
                </div>
                <dl className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <dt className="text-bodydark2">1h</dt>
                    <dd className="font-mono text-base text-black dark:text-white">
                      {provider.last1hCount}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-bodydark2">24h</dt>
                    <dd className="font-mono text-base text-black dark:text-white">
                      {provider.last24hCount}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-bodydark2">7d</dt>
                    <dd className="font-mono text-base text-black dark:text-white">
                      {provider.last7dCount}
                    </dd>
                  </div>
                </dl>
                <div className="mt-3 text-xs text-bodydark2">
                  마지막 수집: {formatMinutes(provider.minutesSinceLatest)}
                  {provider.latestCollectedAt && (
                    <span className="ml-1 text-bodydark2/70">
                      ({dayjs(provider.latestCollectedAt).format('MM/DD HH:mm')})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProviderHealthGrid;
