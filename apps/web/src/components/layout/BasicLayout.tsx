import React from 'react';
import BackButton from './BackButton';
import { cn } from '@/lib/cn';
import BottomNav, { type NAV_TYPE } from './BottomNav';

interface BaseProps {
  children: React.ReactNode;
  title?: string;
  hasBackButton?: boolean;
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
  fullScreen = true,
}: Props) => {
  return (
    <div
      className={cn(
        'relative mx-auto grid max-w-[600px] grid-cols-1 bg-white',
        fullScreen && 'min-h-screen',
        {
          'pb-20': hasBottomNav,
        },
      )}
    >
      {header ?? (
        <header className="fixed top-0 z-50 flex h-11 w-full max-w-[600px] items-center justify-center bg-white text-black">
          {hasBackButton && <div className="absolute left-0">{<BackButton />}</div>}
          {title && <h1 className="text-base font-semibold text-black">{title}</h1>}
        </header>
      )}
      <div className={cn('h-full', { 'pt-11': !header })}>{children}</div>
      {hasBottomNav && <BottomNav type={navType} />}
    </div>
  );
};

export default BasicLayout;
