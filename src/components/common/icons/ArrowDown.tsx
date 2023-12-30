import type { SVGProps } from 'react'
const SvgArrowDown = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" {...props}>
    <path
      fill="#101828"
      fillRule="evenodd"
      d="m19.067 7.562-7.077 7.057-7.057-7.057-.91.91 7.967 7.966 7.987-7.967z"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgArrowDown
