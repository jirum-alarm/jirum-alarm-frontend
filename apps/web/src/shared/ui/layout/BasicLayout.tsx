import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';

import BackButton from './BackButton';
import { type NAV_TYPE } from './BottomNav';
import PageHeader from './PageHeader';

interface BaseProps {
  children: React.ReactNode;
  title?: string;
  hasBackButton?: boolean;
  backTo?: PAGE;
  fullScreen?: boolean;
  header?: React.ReactNode;
}

interface WithBottomNav extends BaseProps {
  hasBottomNav: true;
  navType: NAV_TYPE;
}

interface WithoutBottomNav extends BaseProps {
  hasBottomNav?: false;
  navType?: never;
}

type Props = WithBottomNav | WithoutBottomNav;

const BasicLayout = ({
  children,
  title,
  hasBackButton,
  hasBottomNav,
  navType,
  header,
  backTo,
  fullScreen = true,
}: Props) => {
  return (
    <>
      <div
        className={cn(
          'max-w-mobile-max relative mx-auto box-border grid grid-cols-1 bg-white pb-[var(--bottom-nav-padding)]',
          'mobile-max:before:fixed mobile-max:before:left-1/2 mobile-max:before:top-0 mobile-max:before:-ml-[300px] mobile-max:before:h-full mobile-max:before:w-px mobile-max:before:-translate-x-1/2 mobile-max:before:bg-gray-200',
          'mobile-max:after:fixed mobile-max:after:left-1/2 mobile-max:after:top-0 mobile-max:after:ml-[300px] mobile-max:after:h-full mobile-max:after:w-px mobile-max:after:-translate-x-1/2 mobile-max:after:bg-gray-200',
          // PC(.pc = DesktopReadyLayout)는 고정 GNB(h-14)가 위에 있다 — 칸을 그만큼 내리고 헤더를 그 아래에 붙인다.
          // 폰 테두리는 GNB 와 안 어울려 뺀다. PC 분기에서 BasicLayout 을 쓰는 곳은 (mobile) 그룹뿐이다.
          'pc:pt-14 pc:before:hidden pc:after:hidden pc:[&>header]:top-14',
          fullScreen && 'min-h-screen',
        )}
      >
        {/* 제목도 뒤로가기도 없으면 헤더를 안 그린다 — 빈 흰 바가 fixed 라 내용 위 56px 을 덮었다(가입 완료·로그인 콜백). */}
        {header ??
          ((title || hasBackButton) && (
            <PageHeader
              leading={hasBackButton ? <BackButton backTo={backTo} /> : undefined}
              title={title}
            />
          ))}
        <div
          className={cn('h-full grow', { 'pt-14': header !== undefined || title || hasBackButton })}
        >
          {children}
        </div>
        {/* {hasBottomNav && <BottomNav type={navType} />} */}
      </div>
    </>
  );
};

export default BasicLayout;
