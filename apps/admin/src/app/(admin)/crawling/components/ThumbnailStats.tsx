'use client';

import { useEffect } from 'react';

import ChartCard from '@/app/(admin)/stats/components/ChartCard';
import DateRangeFilter, { useStatsRange } from '@/app/(admin)/stats/components/DateRangeFilter';
import Chart from '@/components/Chart';
import RankList from '@/components/RankList';
import StatTiles from '@/components/StatTiles';
import { useThumbnailStats } from '@/hooks/graphql/stats';
import { toStatsDateRange } from '@/utils/date';

const TYPE_LABEL: Record<string, string> = {
  post: '게시글 이미지',
  mall: '쇼핑몰 이미지',
  missing: '미수집',
};

const ThumbnailStats = () => {
  const [range, setRange] = useStatsRange(7);
  const [fetchStats, { data, loading }] = useThumbnailStats();

  useEffect(() => {
    fetchStats({
      variables: { ...toStatsDateRange(range.startDate, range.endDate), interval: range.interval },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.startDate, range.endDate, range.interval]);

  const stats = data?.thumbnailStats;
  const typeDistribution = stats?.typeDistribution ?? [];
  const total = stats?.totalCount ?? 0;
  const missing = stats?.missingCount ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <DateRangeFilter value={range} onChange={setRange} />

      <StatTiles
        cols={3}
        items={[
          { label: '기간 내 상품', value: total.toLocaleString() },
          {
            label: '썸네일 수집률',
            value: total > 0 ? `${(((total - missing) / total) * 100).toFixed(1)}%` : '-',
          },
          { label: '미수집', value: missing.toLocaleString(), tone: 'danger' },
        ]}
      />

      <ChartCard title="썸네일 출처" loading={loading}>
        <Chart
          type="donut"
          height={240}
          categories={typeDistribution.map(
            (t) => TYPE_LABEL[t.thumbnailType ?? 'missing'] ?? t.thumbnailType ?? '미수집',
          )}
          colors={['#3C50E0', '#10B981', '#FB5454', '#94A3B8']}
          series={typeDistribution.map((t) => t.count)}
        />
      </ChartCard>

      <ChartCard title="쇼핑몰별 수집량 (상위 20)" loading={loading}>
        <RankList
          color="#10B981"
          items={(stats?.mallDistribution ?? []).map((m) => ({
            label: m.mallName,
            value: m.count,
          }))}
        />
      </ChartCard>
    </div>
  );
};

export default ThumbnailStats;
