'use client';

import { useEffect } from 'react';

import RankList from '@/components/RankList';
import { useDailyServiceViewStats, useTopNotificationKeywords } from '@/hooks/graphql/stats';
import { toStatsDateRange } from '@/utils/date';

import ChartCard from './ChartCard';
import DateRangeFilter, { useStatsRange } from './DateRangeFilter';
import TrendCard from './TrendCard';

const EngagementStats = () => {
  const [range, setRange] = useStatsRange();
  const [fetchViewStats, { data: viewData, loading: viewLoading }] = useDailyServiceViewStats();
  const { data: keywordData, loading: keywordLoading } = useTopNotificationKeywords({ limit: 30 });

  useEffect(() => {
    fetchViewStats({
      variables: { ...toStatsDateRange(range.startDate, range.endDate), interval: range.interval },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.startDate, range.endDate, range.interval]);

  return (
    <div className="flex flex-col gap-6">
      <DateRangeFilter value={range} onChange={setRange} />

      <TrendCard
        title="서비스 조회수"
        name="조회수"
        loading={viewLoading}
        rows={viewData?.dailyServiceViewStats ?? []}
      />

      <ChartCard title="알림 키워드 TOP 30" loading={keywordLoading}>
        <RankList
          color="#80CAEE"
          items={(keywordData?.topNotificationKeywords ?? []).map((k) => ({
            label: k.keyword,
            value: k.count,
          }))}
          format={(v) => `${v.toLocaleString()}명`}
        />
      </ChartCard>
    </div>
  );
};

export default EngagementStats;
