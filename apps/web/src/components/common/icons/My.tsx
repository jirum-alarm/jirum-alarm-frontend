import type { SVGProps } from 'react';

const SvgMy = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={28}
    height={28}
    fill="none"
    {...props}
    viewBox="0 0 28 28"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M14 17c-3.17 0-5.99 1.53-7.784 3.906-.386.511-.58.767-.573 1.112.005.267.172.604.382.769.272.213.649.213 1.402.213h13.146c.753 0 1.13 0 1.402-.213.21-.165.377-.502.382-.769.006-.345-.187-.6-.573-1.112C19.99 18.531 17.17 17 14 17M14 14a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9"
    />
  </svg>
);
export default SvgMy;
