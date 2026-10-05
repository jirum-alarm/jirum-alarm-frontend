import type { SVGProps } from 'react';

const Etc = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="6" height="6" rx="1" fill="#4AD11B" />
      <rect x="3" y="11" width="6" height="6" rx="1" fill="var(--color-gray-300)" />
      <rect x="11" y="3" width="6" height="6" rx="1" fill="var(--color-gray-300)" />
      <rect x="11" y="11" width="6" height="6" rx="1" fill="var(--color-gray-300)" />
    </svg>
  );
};

export default Etc;
