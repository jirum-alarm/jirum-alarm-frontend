'use client';

import { useGetVerificationStatistics } from '@/hooks/graphql/verification';

const VerificationStatistics = () => {
  const { data, loading } = useGetVerificationStatistics();

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark"
          >
            <div className="bg-gray-200 dark:bg-gray-700 h-4 w-20 animate-pulse rounded"></div>
            <div className="bg-gray-200 dark:bg-gray-700 mt-2 h-8 w-16 animate-pulse rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const { pending, verified, rejected, total } = data.verificationStatistics;

  const stats = [
    {
      title: '전체',
      value: total,
      color: 'text-primary',
      bgColor: 'bg-primary bg-opacity-10',
      icon: (
        <svg
          className="fill-primary"
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11 2L2 7V10C2 15.55 5.16 20.74 11 22C16.84 20.74 20 15.55 20 10V7L11 2ZM11 4.18L18 8.69V10C18 14.52 15.64 18.69 11 19.93C6.36 18.69 4 14.52 4 10V8.69L11 4.18ZM11 6C8.24 6 6 8.24 6 11C6 13.76 8.24 16 11 16C13.76 16 16 13.76 16 11C16 8.24 13.76 6 11 6ZM11 8C12.66 8 14 9.34 14 11C14 12.66 12.66 14 11 14C9.34 14 8 12.66 8 11C8 9.34 9.34 8 11 8Z"
            fill=""
          />
        </svg>
      ),
    },
    {
      title: '검증 대기',
      value: pending,
      color: 'text-warning',
      bgColor: 'bg-warning bg-opacity-10',
      icon: (
        <svg
          className="fill-warning"
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11 2C5.48 2 1 6.48 1 12C1 17.52 5.48 22 11 22C16.52 22 21 17.52 21 12C21 6.48 16.52 2 11 2ZM11 20C6.59 20 3 16.41 3 12C3 7.59 6.59 4 11 4C15.41 4 19 7.59 19 12C19 16.41 15.41 20 11 20ZM11 6C10.45 6 10 6.45 10 7V12C10 12.55 10.45 13 11 13C11.55 13 12 12.55 12 12V7C12 6.45 11.55 6 11 6ZM11 15C10.45 15 10 15.45 10 16C10 16.55 10.45 17 11 17C11.55 17 12 16.55 12 16C12 15.45 11.55 15 11 15Z"
            fill=""
          />
        </svg>
      ),
    },
    {
      title: '승인됨',
      value: verified,
      color: 'text-success',
      bgColor: 'bg-success bg-opacity-10',
      icon: (
        <svg
          className="fill-success"
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11 2C5.48 2 1 6.48 1 12C1 17.52 5.48 22 11 22C16.52 22 21 17.52 21 12C21 6.48 16.52 2 11 2ZM9 16L4 11L5.41 9.59L9 13.17L16.59 5.58L18 7L9 16Z"
            fill=""
          />
        </svg>
      ),
    },
    {
      title: '거부됨',
      value: rejected,
      color: 'text-danger',
      bgColor: 'bg-danger bg-opacity-10',
      icon: (
        <svg
          className="fill-danger"
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11 2C5.48 2 1 6.48 1 12C1 17.52 5.48 22 11 22C16.52 22 21 17.52 21 12C21 6.48 16.52 2 11 2ZM13 15L11 13L9 15L7 13L9 11L7 9L9 7L11 9L13 7L15 9L13 11L15 13L13 15Z"
            fill=""
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-color dark:text-body-color-dark text-sm font-medium">
                {stat.title}
              </p>
              <p className={`mt-2 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bgColor}`}
            >
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VerificationStatistics;
