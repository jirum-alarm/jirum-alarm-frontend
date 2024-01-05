import type { SVGProps } from 'react'
/** @example
 *  <CheckboxSelected className="text-primary-600" />
 * */
const SvgCheckboxSelected = (props: SVGProps<SVGSVGElement>) => {
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
      <path
        fillRule="evenodd"
        d="M5 3a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm1.215 11.317 5.334 5.335L21.784 9.417l-1.07-1.069-9.165 9.166-4.265-4.266z"
        clipRule="evenodd"
      />
    </svg>
  )
}
export default SvgCheckboxSelected
