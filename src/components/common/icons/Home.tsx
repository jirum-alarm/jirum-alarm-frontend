import type { SVGProps } from "react";
const SvgHome = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={28}
    height={28}
    fill="none"
    {...props}
  >
    <path
      fill="#101828"
      fillRule="evenodd"
      d="M14.456 4.946 14 4.596l-.456.35-10.135 7.767.913 1.19 1.744-1.336v10.875h6.29v-5.388h3.289v5.388h6.29V12.567l1.744 1.336.912-1.19zm5.978 6.471L14 6.487l-6.434 4.93v10.525h3.29v-5.388h6.289v5.388h3.29z"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgHome;
