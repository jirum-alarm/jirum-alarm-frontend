import type { SVGProps } from 'react';

const TrashBin = (props: SVGProps<SVGSVGElement>) => {
  const { width, height, ...others } = props;
  return (
    <svg
      width={width ?? 28}
      height={height ?? 28}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...others}
    >
      <path d="M23.5635 7.75H4.43652" stroke="#101828" strokeWidth="1.5" strokeLinejoin="round" />
      <path
        d="M11.6562 12.4375V18.6875"
        stroke="#101828"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M16.3438 12.4375V18.6875"
        stroke="#101828"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M21.0312 7.75V22.5938C21.0312 22.801 20.9489 22.9997 20.8024 23.1462C20.6559 23.2927 20.4572 23.375 20.25 23.375H7.75C7.5428 23.375 7.34409 23.2927 7.19757 23.1462C7.05106 22.9997 6.96875 22.801 6.96875 22.5938V7.75"
        stroke="#101828"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M17.9062 7.75V6.1875C17.9062 5.7731 17.7416 5.37567 17.4486 5.08265C17.1556 4.78962 16.7582 4.625 16.3438 4.625H11.6562C11.2418 4.625 10.8444 4.78962 10.5514 5.08265C10.2584 5.37567 10.0938 5.7731 10.0938 6.1875V7.75"
        stroke="#101828"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default TrashBin;
