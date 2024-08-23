import type { SVGProps } from 'react';
const SvgIllustWarning = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={101} height={100} fill="none" {...props}>
    <path fill="#fff" d="M.5 0h100v100H.5z" />
    <circle cx={50} cy={50.5} r={39.5} fill="#E4E7EC" />
    <path
      fill="#475467"
      fillRule="evenodd"
      d="M50.32 34a3.527 3.527 0 0 0-3.517 3.78l1.335 18.623a2.368 2.368 0 0 0 4.724 0l1.335-18.624A3.527 3.527 0 0 0 50.679 34zm.18 28.612a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgIllustWarning;
