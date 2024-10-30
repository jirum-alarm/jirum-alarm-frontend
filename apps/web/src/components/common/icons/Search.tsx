import type { SVGProps } from 'react';

const SvgSearch = (props: SVGProps<SVGSVGElement>) => {
  const { width, height, color, ...others } = props;
  return (
    <svg
      width={width ?? 28}
      height={height ?? 28}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...others}
    >
      <path
        d="M23 23L17.0001 17M19 12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12C5 8.13401 8.13401 5 12 5C15.866 5 19 8.13401 19 12Z"
        stroke={color ?? '#fff'}
        strokeWidth="1.5"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </svg>

    // <svg
    //   width={width ?? 21}
    //   height={height ?? 21}
    //   viewBox="0 0 21 21"
    //   fill="none"
    //   xmlns="http://www.w3.org/2000/svg"
    //   {...others}
    // >
    //   <path
    //     fill={color ?? '#fff'}
    //     d="M19 19L13.0001 13M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z"
    //     stroke="white"
    //     strokeWidth="1.5"
    //     strokeLinecap="square"
    //     strokeLinejoin="round"
    //   />
    // </svg>
  );
};

export default SvgSearch;
