/**
 * 어드민 섹션 = URL 첫 경로(홈은 'home'). 백엔드 src/admin/admin-section.ts ADMIN_SECTIONS 와 같은 키.
 * '/permission' 은 admin 역할 전용이라 섹션 목록에 없다.
 */
export const PERMISSION_PATH = '/permission';

export const SECTION_LABELS: Record<string, string> = {
  home: '홈',
  stats: '통계',
  crawling: '크롤링',
  'profit-link': '수익 링크',
  hotdeal: '핫딜 키워드',
  deals: '딜 페이지',
  product: '상품',
  'keyword-map': '키워드맵',
  user: '사용자',
  notification: '알림',
  advertisement: '광고',
};

export const sectionOfPath = (pathname: string) => pathname.split('/')[1] || 'home';

export type AdminAccess = { isAdmin: boolean; sections: string[] };

export const canAccessPath = (access: AdminAccess | undefined, pathname: string) => {
  if (!access) return false;
  if (access.isAdmin) return true;
  if (pathname === PERMISSION_PATH || pathname.startsWith(`${PERMISSION_PATH}/`)) return false;
  return access.sections.includes(sectionOfPath(pathname));
};
