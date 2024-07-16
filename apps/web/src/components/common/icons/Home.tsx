import type { SVGProps } from 'react';
const SvgHome = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} fill="none" {...props}>
    <path
      stroke="#101828"
      strokeLinecap="square"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M10 20h8M13.018 5.497l-6.783 5.275c-.453.353-.68.53-.843.75a2 2 0 0 0-.318.65C5 12.437 5 12.724 5 13.298v7.235c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874c.428.218.988.218 2.108.218h11.6c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874c.218-.428.218-.988.218-2.108v-7.235c0-.574 0-.861-.074-1.126a2 2 0 0 0-.318-.65c-.163-.22-.39-.397-.843-.75l-6.783-5.275c-.351-.273-.527-.41-.72-.462a1 1 0 0 0-.523 0c-.194.052-.37.189-.721.462Z"
    />
  </svg>
);
export default SvgHome;
