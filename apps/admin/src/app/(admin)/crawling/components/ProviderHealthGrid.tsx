'use client';

import { useState } from 'react';

import Panel from '@/components/Panel';
import Spinner from '@/components/Spinner';
import { useProviderHealthStatus } from '@/hooks/graphql/stats';
import { ProviderHealthOutput, ProviderType } from '@/types/stats';

// provider 스케줄에 따라 "정상이라면 N분 안에는 들어와야 함" 임계치.
// values.yaml의 cronjob 스케줄에서 가장 긴 간격(ruliweb=30분)에 여유 1h를 더해 정함.
const STALE_THRESHOLD_MIN = 90;
const CRITICAL_THRESHOLD_MIN = 60 * 6;

type HealthLevel = 'healthy' | 'stale' | 'critical' | 'dead';

/** 홈 '지금 확인할 것'도 같은 기준으로 센다 */
export const getHealthLevel = (provider: ProviderHealthOutput): HealthLevel => {
  if (provider.minutesSinceLatest == null) return 'dead';
  if (provider.minutesSinceLatest >= CRITICAL_THRESHOLD_MIN) return 'critical';
  if (provider.minutesSinceLatest >= STALE_THRESHOLD_MIN) return 'stale';
  return 'healthy';
};

const LEVEL: Record<HealthLevel, { dot: string; label: string; text: string }> = {
  healthy: { dot: 'bg-meta-3', label: '정상', text: 'text-body' },
  stale: { dot: 'bg-warning', label: '지연', text: 'text-warning' },
  critical: { dot: 'bg-danger', label: '심각', text: 'text-danger' },
  dead: { dot: 'bg-bodydark2', label: '7일 무수집', text: 'text-bodydark2' },
};
const LEVEL_ORDER: HealthLevel[] = ['dead', 'critical', 'stale', 'healthy'];

const formatMinutes = (minutes?: number | null) => {
  if (minutes == null) return '7일 이상';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
};

const ProviderHealthGrid = () => {
  // 정상인 곳까지 다 펼치면 폰에서 한참 내려야 한다 — 문제 있는 곳만 먼저
  const [showHealthy, setShowHealthy] = useState(false);
  const { data, loading, error } = useProviderHealthStatus({
    providerType: ProviderType.COMMUNITY,
  });

  if (loading && !data) {
    return (
      <Panel className="p-4 sm:p-6">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
          커뮤니티 수집 상태
        </h3>
        <div className="flex h-32 items-center justify-center">
          <Spinner size="lg" />
        </div>
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel className="p-4 sm:p-6">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
          커뮤니티 수집 상태
        </h3>
        <p className="text-sm text-danger">에러: {error.message}</p>
      </Panel>
    );
  }

  const providers = [...(data?.providerHealthStatus ?? [])].sort((a, b) => {
    const diff = LEVEL_ORDER.indexOf(getHealthLevel(a)) - LEVEL_ORDER.indexOf(getHealthLevel(b));
    return diff !== 0 ? diff : b.last24hCount - a.last24hCount;
  });
  const healthyCount = providers.filter((p) => getHealthLevel(p) === 'healthy').length;
  const counts = LEVEL_ORDER.map((level) => ({
    level,
    n: providers.filter((p) => getHealthLevel(p) === level).length,
  })).filter((c) => c.n > 0);

  return (
    <Panel className="p-4 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h3 className="text-lg font-semibold text-black dark:text-white">커뮤니티 수집 상태</h3>
        <span className="text-xs text-bodydark2">1분마다 갱신</span>
      </div>
      {counts.length > 0 && (
        <p className="mb-3 flex flex-wrap gap-x-3 text-sm">
          {counts.map((c) => (
            <span key={c.level} className="flex items-center gap-1.5 text-black dark:text-white">
              <span className={`h-2 w-2 rounded-full ${LEVEL[c.level].dot}`} />
              {LEVEL[c.level].label} <b>{c.n}</b>
            </span>
          ))}
        </p>
      )}

      {providers.length === 0 ? (
        <p className="py-8 text-center text-bodydark2">커뮤니티 정보가 없습니다.</p>
      ) : (
        <ul className="grid divide-y divide-stroke md:grid-cols-2 md:gap-x-6 md:divide-y-0 xl:grid-cols-3 dark:divide-strokedark">
          {providers
            .filter((p) => showHealthy || getHealthLevel(p) !== 'healthy')
            .map((provider) => {
              const level = LEVEL[getHealthLevel(provider)];
              return (
                <li
                  key={provider.providerId}
                  className="py-2 md:border-b md:border-stroke md:dark:border-strokedark"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 font-medium text-black dark:text-white">
                      <span className={`h-2 w-2 rounded-full ${level.dot}`} />
                      {provider.providerName}
                    </span>
                    <span className={`text-xs ${level.text}`}>
                      {formatMinutes(provider.minutesSinceLatest)}
                    </span>
                  </div>
                  <p className="mt-0.5 ml-4 text-xs text-bodydark2">
                    1시간 {provider.last1hCount} · 24시간 {provider.last24hCount.toLocaleString()} ·
                    7일 {provider.last7dCount.toLocaleString()}
                  </p>
                </li>
              );
            })}
        </ul>
      )}
      {healthyCount > 0 && (
        <button
          type="button"
          onClick={() => setShowHealthy((v) => !v)}
          className="mt-2 w-full rounded-lg border border-stroke py-2 text-sm font-medium text-body dark:border-strokedark"
        >
          {showHealthy ? '정상 접기' : `정상 ${healthyCount}개 보기`}
        </button>
      )}
    </Panel>
  );
};

export default ProviderHealthGrid;
