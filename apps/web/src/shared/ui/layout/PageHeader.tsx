import { cn } from '@/shared/lib/cn';

/**
 * 앱 전역 상단 고정 헤더. 모든 페이지 헤더는 이 컴포넌트를 거친다.
 *
 * 이전에는 헤더 22 개가 각자 <header> 를 손으로 짜면서 높이·테두리·z-index·패딩·
 * 타이틀 타이포가 제각각이었다(테두리만 5 종, z-50/z-40/z-20 혼재, px-5/px-3 혼재).
 * 그 값들을 여기 한 곳에 모은다. 페이지는 좌/우 슬롯과 타이틀만 넘긴다.
 */
interface PageHeaderProps {
  /** 뒤로가기 버튼 등 좌측 최선두 요소. 로고·타이틀보다 앞에 온다. */
  leading?: React.ReactNode;
  /** 텍스트 타이틀. logo 와 동시에 쓰지 않는다. */
  title?: React.ReactNode;
  /** 로고를 좌측에 놓을지. title 대신 쓴다. */
  logo?: React.ReactNode;
  /** 우측 액션 묶음(검색·공유·메뉴 등). */
  actions?: React.ReactNode;
  /** 하단 경계선을 그릴지. 기본 true. 히어로 위에 얹히는 투명 헤더만 false. */
  bordered?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const PAGE_HEADER_HEIGHT_CLASS = 'h-14';

export default function PageHeader({
  leading,
  title,
  logo,
  actions,
  bordered = true,
  className,
  children,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'max-w-mobile-max fixed top-0 z-50 flex h-14 w-full items-center justify-between gap-2 bg-white px-5',
        bordered && 'border-b border-gray-100',
        className,
      )}
    >
      {children ?? (
        <>
          <div className="flex min-w-0 grow items-center gap-x-1">
            {leading}
            {logo}
            {title != null &&
              (typeof title === 'string' ? (
                <h1 className="truncate text-lg font-semibold text-gray-900">{title}</h1>
              ) : (
                title
              ))}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-x-4">{actions}</div>}
        </>
      )}
    </header>
  );
}
