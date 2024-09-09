import type { SVGProps } from 'react';

const SvgCancel = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" {...props}>
    <path
      fill="#D0D5DD"
      d="M8.968 15.919 12 12.887l3.032 3.032.887-.887L12.887 12l3.032-3.032-.887-.887L12 11.113 8.968 8.08l-.887.887L11.113 12 8.08 15.032zM12.001 20a7.794 7.794 0 0 1-3.12-.63 8.08 8.08 0 0 1-2.54-1.71 8.078 8.078 0 0 1-1.71-2.54A7.786 7.786 0 0 1 4 12.002c0-1.106.21-2.146.63-3.12.42-.973.99-1.82 1.71-2.54a8.077 8.077 0 0 1 2.54-1.71A7.786 7.786 0 0 1 11.998 4c1.106 0 2.146.21 3.12.63.973.42 1.82.99 2.54 1.71s1.29 1.566 1.71 2.54c.42.972.631 2.012.631 3.119 0 1.106-.21 2.146-.63 3.12a8.08 8.08 0 0 1-1.71 2.54 8.078 8.078 0 0 1-2.54 1.71c-.972.42-2.012.631-3.119.631"
    />
  </svg>
);
export default SvgCancel;
