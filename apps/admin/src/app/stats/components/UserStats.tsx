'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

import {
  useTopFavoriteCategories,
  useUserDemographicStats,
  useUserRegistrationStats,
} from '@/hooks/graphql/stats';
import { DateInterval } from '@/types/stats';
import { formatStatsDate } from '@/utils/date';

import ChartCard from './ChartCard';
import DateRangeFilter from './DateRangeFilter';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const getDefaultDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
};

const UserStats = () => {
  const defaultRange = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [interval, setInterval] = useState<DateInterval>(DateInterval.DAILY);

  const [fetchRegistrationStats, { data: registrationData, loading: registrationLoading }] =
    useUserRegistrationStats();

  const { data: demographicData, loading: demographicLoading } = useUserDemographicStats();
  const { data: categoryData, loading: categoryLoading } = useTopFavoriteCategories({ limit: 10 });

  const handleSearch = () => {
    fetchRegistrationStats({
      variables: { startDate, endDate, interval },
    });
  };

  const registrationStats = registrationData?.userRegistrationStats ?? [];
  const demographics = demographicData?.userDemographicStats;
  const favoriteCategories = categoryData?.topFavoriteCategories ?? [];

  return (
    <div className="flex flex-col gap-6">
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        interval={interval}
        onChangeStartDate={setStartDate}
        onChangeEndDate={setEndDate}
        onChangeInterval={setInterval}
        onSearch={handleSearch}
      />

      <ChartCard title="가입자 수 추이" loading={registrationLoading}>
        {registrationStats.length > 0 ? (
          <Chart
            type="line"
            height={350}
            options={{
              chart: { toolbar: { show: true } },
              xaxis: {
                categories: registrationStats.map((d) => formatStatsDate(d.date)),
                labels: { rotate: -45 },
              },
              yaxis: { title: { text: '가입자 수' } },
              stroke: { curve: 'smooth', width: 2 },
              colors: ['#3C50E0'],
            }}
            series={[
              {
                name: '가입자 수',
                data: registrationStats.map((d) => d.count),
              },
            ]}
          />
        ) : (
          <p className="py-8 text-center text-bodydark2">조회 버튼을 눌러 데이터를 불러오세요.</p>
        )}
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="성별 분포" loading={demographicLoading}>
          {demographics?.genderDistribution && demographics.genderDistribution.length > 0 ? (
            <Chart
              type="pie"
              height={300}
              options={{
                labels: demographics.genderDistribution.map((d) => d.gender || '미설정'),
                colors: ['#3C50E0', '#80CAEE', '#10B981', '#FB5454'],
                legend: { position: 'bottom' },
              }}
              series={demographics.genderDistribution.map((d) => d.count)}
            />
          ) : (
            <p className="py-8 text-center text-bodydark2">데이터가 없습니다.</p>
          )}
        </ChartCard>

        <ChartCard title="연령대 분포" loading={demographicLoading}>
          {demographics?.ageDistribution && demographics.ageDistribution.length > 0 ? (
            <Chart
              type="bar"
              height={300}
              options={{
                chart: { toolbar: { show: false } },
                xaxis: {
                  categories: demographics.ageDistribution.map((d) => d.ageGroup),
                },
                yaxis: { title: { text: '사용자 수' } },
                colors: ['#3C50E0'],
                plotOptions: {
                  bar: { borderRadius: 4, columnWidth: '50%' },
                },
              }}
              series={[
                {
                  name: '사용자 수',
                  data: demographics.ageDistribution.map((d) => d.count),
                },
              ]}
            />
          ) : (
            <p className="py-8 text-center text-bodydark2">데이터가 없습니다.</p>
          )}
        </ChartCard>
      </div>

      <ChartCard title="인기 관심 카테고리 TOP 10" loading={categoryLoading}>
        {favoriteCategories.length > 0 ? (
          <Chart
            type="bar"
            height={350}
            options={{
              chart: { toolbar: { show: false } },
              xaxis: {
                categories: favoriteCategories.map((c) => c.categoryName),
                labels: { rotate: -45 },
              },
              yaxis: { title: { text: '사용자 수' } },
              colors: ['#80CAEE'],
              plotOptions: {
                bar: { borderRadius: 4, columnWidth: '60%' },
              },
            }}
            series={[
              {
                name: '사용자 수',
                data: favoriteCategories.map((c) => c.count),
              },
            ]}
          />
        ) : (
          <p className="py-8 text-center text-bodydark2">데이터가 없습니다.</p>
        )}
      </ChartCard>
    </div>
  );
};

export default UserStats;
