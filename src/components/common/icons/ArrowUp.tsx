import type { SVGProps } from 'react'
const SvgArrowUp = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" {...props}>
    <path
      fill="#101828"
      fillRule="evenodd"
      d="m12.01 9.38-7.077 7.058-.91-.91 7.986-7.966 7.968 7.967-.91.91z"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgArrowUp
