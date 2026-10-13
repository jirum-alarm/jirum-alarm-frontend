import type { AnchorHTMLAttributes } from 'react';

/**
 * 본 서비스(apps/web) 경로로 가는 링크 — 상품 상세·검색·로그인·마이페이지·알림.
 * next/link 는 basePath(/beauty)를 붙이고 이 앱 라우터 안에서 이동하려 하므로 일반 <a> 로 건다(문서 이동).
 */
export default function ServiceLink(
  props: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string },
) {
  return <a {...props} />;
}
