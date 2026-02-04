import type { SVGProps } from 'react';

const SvgClose = (props: SVGProps<SVGSVGElement>) => {
  const { className, width, height, ...others } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ?? 24}
      height={height ?? 24}
      viewBox="0 0 24 24"
      fill="none"
      className={`fill-current ${className}`}
      {...others}
    >
      <path d="M6.4 18.654 5.346 17.6l5.6-5.6-5.6-5.6L6.4 5.346l5.6 5.6 5.6-5.6L18.654 6.4l-5.6 5.6 5.6 5.6-1.054 1.054-5.6-5.6z" />
    </svg>
  );
};
export default SvgClose;
