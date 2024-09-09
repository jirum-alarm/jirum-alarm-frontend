import type { SVGProps } from 'react';

const SvgGoogle = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" {...props}>
    <path
      fill="#000"
      d="M3.458 21c-.305-.14-.458-.492-.458-.844V4.335c0-.28.076-.491.153-.773.076-.14.228-.28.38-.421 3.28 3.023 6.484 6.046 9.687 9.07C9.94 15.023 6.737 17.977 3.458 21M16.424 9.117c-.916.844-1.907 1.688-2.822 2.602-3.051-2.883-6.178-5.766-9.23-8.649 0 0 0-.07.077-.07 3.966 2.039 7.932 4.078 11.975 6.117M4.373 21c3.05-2.812 6.178-5.625 9.229-8.437.838.773 1.754 1.546 2.745 2.39C12.381 16.993 8.415 19.031 4.45 21zM16.881 14.672c-.991-.844-1.906-1.688-2.898-2.531l2.975-2.743c.305.141.61.282.915.493.763.422 1.602.773 2.364 1.195.23.07.382.21.534.422q.457.527 0 1.055c-.152.14-.305.28-.534.351-1.067.633-2.211 1.195-3.356 1.758"
    />
  </svg>
);
export default SvgGoogle;
