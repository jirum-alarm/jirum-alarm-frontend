import type { SVGProps } from 'react'
/** @example
 *  <CheckDefault className="text-primary-600" />
 * */
const SvgCheckDefault = (props: SVGProps<SVGSVGElement>) => {
  const { className, ...others } = props
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={28}
      height={28}
      fill="none"
      className={`fill-current ${className}`}
      {...others}
    >
      <path d="m11.55 19.652-5.335-5.335 1.07-1.069 4.264 4.266 9.166-9.166 1.069 1.07z" />
    </svg>
  )
}
export default SvgCheckDefault
