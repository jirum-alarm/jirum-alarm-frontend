'use client';

import { useEffect } from 'react';

import Chart from '@/components/Chart';
import RankList from '@/components/RankList';
import {
  useTopFavoriteCategories,
  useUserDemographicStats,
  useUserRegistrationStats,
} from '@/hooks/graphql/stats';
import { GENDER_LABEL, labelOf } from '@/lib/labels';
import { toStatsDateRange } from '@/utils/date';

import ChartCard from './ChartCard';
import DateRangeFilter, { useStatsRange } from './DateRangeFilter';
import TrendCard from './TrendCard';

const UserStats = () => {
  const [range, setRange] = useStatsRange();
  const [fetchRegistrationStats, { data: registrationData, loading: registrationLoading }] =
    useUserRegistrationStats();
  const { data: demographicData, loading: demographicLoading } = useUserDemographicStats();
  const { data: categoryData, loading: categoryLoading } = useTopFavoriteCategories({ limit: 10 });

  useEffect(() => {
    fetchRegistrationStats({
      variables: { ...toStatsDateRange(range.startDate, range.endDate), interval: range.interval },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.startDate, range.endDate, range.interval]);

  const demographics = demographicData?.userDemographicStats;
  const genders = demographics?.genderDistribution ?? [];
  const ages = demographics?.ageDistribution ?? [];

  return (
    <div className="flex flex-col gap-6">
      <DateRangeFilter value={range} onChange={setRange} />

      <TrendCard
        title="가입자 수"
        name="가입자"
        loading={registrationLoading}
        rows={registrationData?.userRegistrationStats ?? []}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="성별" loading={demographicLoading}>
          <Chart
            type="donut"
            height={240}
            categories={genders.map((d) => (d.gender ? labelOf(GENDER_LABEL, d.gender) : '미설정'))}
            colors={['#3C50E0', '#FB5454', '#94A3B8', '#10B981']}
            series={genders.map((d) => d.count)}
          />
        </ChartCard>

        <ChartCard title="연령대" loading={demographicLoading}>
          <Chart
            type="bar"
            categories={ages.map((d) => d.ageGroup)}
            colors={['#3C50E0']}
            series={[{ name: '사용자', data: ages.map((d) => d.count) }]}
          />
        </ChartCard>
      </div>

      <ChartCard title="인기 관심 카테고리 TOP 10" loading={categoryLoading}>
        <RankList
          items={(categoryData?.topFavoriteCategories ?? []).map((c) => ({
            label: c.categoryName,
            value: c.count,
          }))}
          format={(v) => `${v.toLocaleString()}명`}
        />
      </ChartCard>
    </div>
  );
};

export default UserStats;
