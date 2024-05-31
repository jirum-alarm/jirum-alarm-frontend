import type { SVGProps } from 'react';
const SvgIllustError = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={121} height={120} fill="none" {...props}>
    <path fill="#fff" d="M.5 0h120v120H.5z" />
    <path
      fill="#E4E7EC"
      d="M53.072 19c3.079-5.333 10.777-5.333 13.856 0l40.703 70.5c3.079 5.333-.77 12-6.928 12H19.297c-6.159 0-10.008-6.667-6.929-12z"
    />
    <path
      fill="#475467"
      fillRule="evenodd"
      d="M59.796 43.9a4 4 0 0 0-3.99 4.286l1.514 21.12a2.686 2.686 0 0 0 5.358 0l1.514-21.12a4 4 0 0 0-3.99-4.286zM60 77.2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgIllustError;
