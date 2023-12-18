import type { SVGProps } from 'react'
const SvgArrowLeft = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" {...props}>
    <path fill="#212121" d="M15 22 5 12 15 2l1.775 1.775L8.55 12l8.225 8.225z" />
  </svg>
)
export default SvgArrowLeft
