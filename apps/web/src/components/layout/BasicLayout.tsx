import { PAGE } from '@/constants/page';
import { cn } from '@/lib/cn';

import BackButton from './BackButton';
import { type NAV_TYPE } from './BottomNav';

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
          'relative mx-auto grid max-w-screen-layout-max grid-cols-1 bg-white',
          fullScreen && 'min-h-screen',
          {
            'pb-20': hasBottomNav,
          },
        )}
      >
        {header ?? (
          <header className="fixed top-0 z-50 flex h-14 w-full max-w-screen-layout-max items-center gap-x-1 border-b border-white bg-white px-5 text-black">
            {hasBackButton && <BackButton backTo={backTo} />}
            {title && <h1 className="text-lg font-bold text-black">{title}</h1>}
          </header>
        )}
        <div className={cn('h-full', { 'pt-14': !header })}>{children}</div>
        {/* {hasBottomNav && <BottomNav type={navType} />} */}
      </div>
    </>
  );
};

export default BasicLayout;
