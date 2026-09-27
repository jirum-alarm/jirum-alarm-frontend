'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

import {
  useDailyServiceViewStats,
  useProductCountByCategory,
  useProductRegistrationStats,
  useTopFavoriteCategories,
  useTopNotificationKeywords,
  useUserDemographicStats,
  useUserRegistrationStats,
} from '@/hooks/graphql/stats';
import { DateCountOutput, DateInterval } from '@/types/stats';
import { formatStatsDate } from '@/utils/date';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const formatDateCategories = (data: DateCountOutput[]) => data.map((d) => formatStatsDate(d.date));

const getDefaultDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
};

const Dashboard = () => {
  const defaultRange = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [interval, setInterval] = useState<DateInterval>(DateInterval.DAILY);

  const [fetchUserStats, { data: userData, loading: userLoading }] = useUserRegistrationStats();
  const [fetchProductStats, { data: productData, loading: productLoading }] =
    useProductRegistrationStats();
  const [fetchViewStats, { data: viewData, loading: viewLoading }] = useDailyServiceViewStats();

  const { data: demographicData, loading: demographicLoading } = useUserDemographicStats();
  const { data: categoryData, loading: categoryLoading } = useTopFavoriteCategories({ limit: 10 });
  const { data: productCategoryData, loading: productCategoryLoading } =
    useProductCountByCategory();
  const { data: keywordData, loading: keywordLoading } = useTopNotificationKeywords({ limit: 20 });

  const handleSearch = () => {
    const variables = { startDate, endDate, interval };
    fetchUserStats({ variables });
    fetchProductStats({ variables });
    fetchViewStats({ variables });
  };

  const userStats = userData?.userRegistrationStats ?? [];
  const productStats = productData?.productRegistrationStats ?? [];
  const viewStats = viewData?.dailyServiceViewStats ?? [];
  const demographics = demographicData?.userDemographicStats;
  const favoriteCategories = categoryData?.topFavoriteCategories ?? [];
  const productCategories = productCategoryData?.productCountByCategory ?? [];
  const keywords = keywordData?.topNotificationKeywords ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* 날짜 필터 */}
      <div className="rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">
              시작일
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">
              종료일
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">
              간격
            </label>
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value as DateInterval)}
              className="rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
            >
              <option value={DateInterval.DAILY}>일별</option>
              <option value={DateInterval.WEEKLY}>주별</option>
              <option value={DateInterval.MONTHLY}>월별</option>
            </select>
          </div>
          <button
            onClick={handleSearch}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
          >
            조회
          </button>
        </div>
      </div>

      {/* 1. 서비스 조회수 추이 */}
      <ChartCard title="서비스 조회수 추이" loading={viewLoading}>
        {viewStats.length > 0 ? (
          <Chart
            type="area"
            height={300}
            options={{
              chart: { toolbar: { show: true } },
              xaxis: { categories: formatDateCategories(viewStats), labels: { rotate: -45 } },
              yaxis: { title: { text: '조회수' } },
              stroke: { curve: 'smooth', width: 2 },
              fill: {
                type: 'gradient',
                gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 },
              },
              colors: ['#3C50E0'],
            }}
            series={[{ name: '조회수', data: viewStats.map((d) => d.count) }]}
          />
        ) : (
          <EmptyMessage />
        )}
      </ChartCard>

      {/* 2. 가입자 수 추이 & 신규 상품 등록 수 */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="가입자 수 추이" loading={userLoading}>
          {userStats.length > 0 ? (
            <Chart
              type="line"
              height={280}
              options={{
                chart: { toolbar: { show: false } },
                xaxis: { categories: formatDateCategories(userStats), labels: { rotate: -45 } },
                yaxis: { title: { text: '가입자 수' } },
                stroke: { curve: 'smooth', width: 2 },
                colors: ['#10B981'],
              }}
              series={[{ name: '가입자 수', data: userStats.map((d) => d.count) }]}
            />
          ) : (
            <EmptyMessage />
          )}
        </ChartCard>

        <ChartCard title="신규 상품 등록 수" loading={productLoading}>
          {productStats.length > 0 ? (
            <Chart
              type="line"
              height={280}
              options={{
                chart: { toolbar: { show: false } },
                xaxis: {
                  categories: formatDateCategories(productStats),
                  labels: { rotate: -45 },
                },
                yaxis: { title: { text: '등록 수' } },
                stroke: { curve: 'smooth', width: 2 },
                colors: ['#80CAEE'],
              }}
              series={[{ name: '등록 수', data: productStats.map((d) => d.count) }]}
            />
          ) : (
            <EmptyMessage />
          )}
        </ChartCard>
      </div>

      {/* 3. 알림 키워드 TOP 20 */}
      <ChartCard title="알림 키워드 TOP 20" loading={keywordLoading}>
        {keywords.length > 0 ? (
          <Chart
            type="bar"
            height={450}
            options={{
              chart: { toolbar: { show: false } },
              plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '70%' } },
              xaxis: { title: { text: '등록 수' } },
              yaxis: { labels: { maxWidth: 150 } },
              colors: ['#80CAEE'],
              dataLabels: { enabled: true },
            }}
            series={[
              {
                name: '등록 수',
                data: keywords.map((k) => ({ x: k.keyword, y: k.count })),
              },
            ]}
          />
        ) : (
          <p className="py-8 text-center text-bodydark2">데이터가 없습니다.</p>
        )}
      </ChartCard>

      {/* 4. 성별/연령대 분포 */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="성별 분포" loading={demographicLoading}>
          {demographics?.genderDistribution && demographics.genderDistribution.length > 0 ? (
            <Chart
              type="pie"
              height={280}
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
              height={280}
              options={{
                chart: { toolbar: { show: false } },
                xaxis: { categories: demographics.ageDistribution.map((d) => d.ageGroup) },
                yaxis: { title: { text: '사용자 수' } },
                colors: ['#3C50E0'],
                plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
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

      {/* 5. 인기 카테고리 & 카테고리별 상품 수 */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="인기 관심 카테고리 TOP 10" loading={categoryLoading}>
          {favoriteCategories.length > 0 ? (
            <Chart
              type="bar"
              height={280}
              options={{
                chart: { toolbar: { show: false } },
                xaxis: {
                  categories: favoriteCategories.map((c) => c.categoryName),
                  labels: { rotate: -45 },
                },
                yaxis: { title: { text: '사용자 수' } },
                colors: ['#80CAEE'],
                plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
              }}
              series={[{ name: '사용자 수', data: favoriteCategories.map((c) => c.count) }]}
            />
          ) : (
            <p className="py-8 text-center text-bodydark2">데이터가 없습니다.</p>
          )}
        </ChartCard>

        <ChartCard title="카테고리별 상품 수" loading={productCategoryLoading}>
          {productCategories.length > 0 ? (
            <Chart
              type="bar"
              height={280}
              options={{
                chart: { toolbar: { show: false } },
                xaxis: {
                  categories: productCategories.map((c) => c.categoryName),
                  labels: { rotate: -45 },
                },
                yaxis: { title: { text: '상품 수' } },
                colors: ['#3C50E0'],
                plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
              }}
              series={[{ name: '상품 수', data: productCategories.map((c) => c.count) }]}
            />
          ) : (
            <p className="py-8 text-center text-bodydark2">데이터가 없습니다.</p>
          )}
        </ChartCard>
      </div>
    </div>
  );
};

export default Dashboard;

function ChartCard({
  title,
  loading,
  children,
}: {
  title: string;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">{title}</h3>
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function EmptyMessage() {
  return <p className="py-8 text-center text-bodydark2">조회 버튼을 눌러 데이터를 불러오세요.</p>;
}
