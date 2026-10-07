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

/** PC 에선 고정 앱바(PageHeader)를 내용 위 제목으로 바꾼다. TermsLayout 도 같이 쓴다.
 *  z-auto: 앱바의 z-50 은 static 이어도 grid 자식이라 살아 있어, GNB 아래 테두리를 제목 폭만큼 덮었다. */
export const PC_PAGE_HEADER = cn(
  'pc:[&>header]:static pc:[&>header]:z-auto pc:[&>header]:h-auto pc:[&>header]:max-w-none pc:[&>header]:border-0 pc:[&>header]:pt-8 pc:[&>header]:pb-6',
  'pc:[&>header_h1]:text-xl pc:[&>header_h1]:font-bold',
  "pc:[&>header_button[aria-label='뒤로_가기']]:hidden",
);

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
        data-basic-layout
        className={cn(
          'max-w-mobile-max relative mx-auto box-border grid grid-cols-1 bg-white pb-[var(--bottom-nav-padding)]',
          'mobile-max:before:fixed mobile-max:before:left-1/2 mobile-max:before:top-0 mobile-max:before:-ml-[300px] mobile-max:before:h-full mobile-max:before:w-px mobile-max:before:-translate-x-1/2 mobile-max:before:bg-gray-200',
          'mobile-max:after:fixed mobile-max:after:left-1/2 mobile-max:after:top-0 mobile-max:after:ml-[300px] mobile-max:after:h-full mobile-max:after:w-px mobile-max:after:-translate-x-1/2 mobile-max:after:bg-gray-200',
          // PC(.pc = DesktopReadyLayout)는 PC 폼 화면(products/new)과 같은 틀: GNB 아래 가운데 672px 칸 + 큰 제목.
          // 모바일 티(폰 테두리·고정 앱바·뒤로가기)는 뺀다 — 이동은 GNB·브라우저 뒤로가기가 맡는다.
          // PC 분기에서 BasicLayout 을 쓰는 곳은 (mobile) 그룹뿐이다.
          'pc:max-w-2xl pc:content-start pc:pt-14 pc:before:hidden pc:after:hidden',
          PC_PAGE_HEADER,
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
          className={cn('pc:pt-0 h-full grow', {
            'pt-14': header !== undefined || title || hasBackButton,
          })}
        >
          {children}
        </div>
        {/* {hasBottomNav && <BottomNav type={navType} />} */}
      </div>
    </>
  );
};

export default BasicLayout;
