import type { SVGProps } from 'react';
const SvgApple = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" {...props}>
    <path
      fill="#000"
      d="M16.693 12.57c-.018-2.272 1.78-3.38 1.863-3.43-1.019-1.553-2.598-1.766-3.155-1.781-1.328-.145-2.612.83-3.29.83-.687 0-1.728-.815-2.852-.792-1.444.023-2.794.898-3.533 2.254-1.528 2.767-.39 6.833 1.077 9.071C7.534 19.82 8.389 21.041 9.51 21c1.095-.046 1.507-.731 2.828-.731 1.31 0 1.695.731 2.838.704 1.175-.019 1.917-1.1 2.623-2.204A9.3 9.3 0 0 0 19 16.214c-.03-.02-2.285-.921-2.307-3.643m-2.158-6.684c.59-.773.994-1.82.88-2.886-.85.038-1.92.617-2.532 1.37-.542.667-1.03 1.755-.902 2.78.953.072 1.94-.507 2.554-1.264"
    />
  </svg>
);
export default SvgApple;