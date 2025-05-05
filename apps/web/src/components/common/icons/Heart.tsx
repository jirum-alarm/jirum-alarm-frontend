import { SVGProps } from 'react';

const Heart = (props: SVGProps<SVGSVGElement> & { isLiked?: boolean; color?: string }) => {
  const { isLiked, width, height, color, ...others } = props;
  if (isLiked) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ?? 24}
        height={height ?? 24}
        viewBox="0 0 24 24"
        fill="#EF334A"
        {...others}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.9931 5.33265C10.0271 3.03418 6.74861 2.4159 4.2853 4.52061C1.82199 6.62531 1.47519 10.1443 3.40964 12.6335C5.018 14.7032 9.88548 19.0682 11.4808 20.481C11.6593 20.639 11.7485 20.7181 11.8526 20.7491C11.9434 20.7762 12.0428 20.7762 12.1337 20.7491C12.2378 20.7181 12.327 20.639 12.5055 20.481C14.1008 19.0682 18.9683 14.7032 20.5766 12.6335C22.5111 10.1443 22.2066 6.60317 19.701 4.52061C17.1953 2.43804 13.9592 3.03418 11.9931 5.33265Z"
          fill="#EF334A"
          stroke="#EF334A"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ?? 24}
      height={height ?? 24}
      viewBox="0 0 24 24"
      fill="none"
      {...others}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9931 5.33265C10.0271 3.03418 6.74861 2.4159 4.2853 4.52061C1.82199 6.62531 1.47519 10.1443 3.40964 12.6335C5.018 14.7032 9.88548 19.0682 11.4808 20.481C11.6593 20.639 11.7485 20.7181 11.8526 20.7491C11.9434 20.7762 12.0428 20.7762 12.1337 20.7491C12.2378 20.7181 12.327 20.639 12.5055 20.481C14.1008 19.0682 18.9683 14.7032 20.5766 12.6335C22.5111 10.1443 22.2066 6.60317 19.701 4.52061C17.1953 2.43804 13.9592 3.03418 11.9931 5.33265Z"
        stroke={color ?? '#344054'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Heart;
