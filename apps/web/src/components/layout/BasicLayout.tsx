import React from 'react';
import BackButton from './BackButton';
import { cn } from '@/lib/cn';
import BottomNav, { type NAV_TYPE } from './BottomNav';
import { PAGE } from '@/constants/page';

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
        <header className="fixed top-0 z-50 flex h-11 w-full max-w-screen-layout-max items-center justify-center bg-white text-black">
          {hasBackButton && <div className="absolute left-0">{<BackButton backTo={backTo} />}</div>}
          {title && <h1 className="text-base font-semibold text-black">{title}</h1>}
        </header>
      )}
      <div className={cn('h-full', { 'pt-11': !header })}>{children}</div>
      {hasBottomNav && <BottomNav type={navType} />}
    </div>
  );
};

export default BasicLayout;
