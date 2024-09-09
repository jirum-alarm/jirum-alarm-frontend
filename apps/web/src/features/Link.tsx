import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react';

type LinkProps = NextLinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps> & {
    children?: ReactNode;
  };

/**
 * prefetch 사용 후 배포시 알 수 없는 에러 발생의 이유로 next Link 컴포넌트를 래핑하여 사용 중
 * 서비스의 v1.0.2 부터 점진적으로 prefecth 적용하며 문제가 없어졌기 때문에 true를 기본값으로 롤백
 * 모니터링 후에 더 이상 문제가 재발생하지 않으면 이 컴포넌트를 삭제하여도 됨
 * @see https://github.com/vercel/next.js/discussions/24009
 * */
const Link = forwardRef<HTMLAnchorElement, LinkProps>(function LinkWithRef(
  { prefetch = true, ...rest },
  ref,
) {
  return <NextLink prefetch={prefetch} {...rest} ref={ref} />;
});

export default Link;
