'use client';

import { useGetVerificationStatistics } from '@/hooks/graphql/verification';

const StatsCards = () => {
  const { data } = useGetVerificationStatistics();
  const stats = data?.verificationStatistics;

  const cards = [
    {
      label: '검증 대기',
      value: stats?.pending ?? 0,
      color: 'text-warning',
      bgColor: 'bg-warning',
    },
    {
      label: '검증 완료',
      value: stats?.verified ?? 0,
      color: 'text-success',
      bgColor: 'bg-success',
    },
    {
      label: '검증 거절',
      value: stats?.rejected ?? 0,
      color: 'text-danger',
      bgColor: 'bg-danger',
    },
    {
      label: '전체',
      value: stats?.total ?? 0,
      color: 'text-primary',
      bgColor: 'bg-primary',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark"
        >
          <div
            className={`flex h-11.5 w-11.5 items-center justify-center rounded-full ${card.bgColor} bg-opacity-10`}
          >
            <span className={`text-xl font-bold ${card.color}`}>#</span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">
                {card.value.toLocaleString()}
              </h4>
              <span className="text-sm font-medium text-bodydark2">{card.label}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
