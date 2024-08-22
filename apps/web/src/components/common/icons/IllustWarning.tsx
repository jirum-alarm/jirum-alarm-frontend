import type { SVGProps } from 'react';
const SvgIllustWarning = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={100} height={100} fill="none" {...props}>
    <path fill="#fff" d="M0 0h100v100H0z" />
    <circle cx={49.5} cy={50.5} r={39} fill="#E4E7EC" stroke="#000" />
    <path
      fill="#475467"
      fillRule="evenodd"
      d="M49.82 34a3.527 3.527 0 0 0-3.517 3.78l1.335 18.623a2.368 2.368 0 0 0 4.724 0l1.335-18.624A3.527 3.527 0 0 0 50.179 34zM50 62.612a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgIllustWarning;
