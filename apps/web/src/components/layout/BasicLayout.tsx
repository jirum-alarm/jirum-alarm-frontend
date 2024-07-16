import React from 'react';
import BackButton from './BackButton';
import { cn } from '@/lib/cn';
import BottomNav, { type NAV_TYPE } from './BottomNav';

interface BaseProps {
  children: React.ReactNode;
  title?: string;
  hasBackButton?: boolean;
  fullScreen?: boolean;
}

interface WithBottomNav extends BaseProps {
  hasBottomNav: true;
  navType: NAV_TYPE; // 필요한 타입으로 변경
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
  fullScreen = true,
}: Props) => {
  return (
    <div
      className={cn('relative mx-auto grid max-w-[480px] bg-white', fullScreen && 'min-h-screen', {
        'pb-20': hasBottomNav,
      })}
    >
      <header className="fixed top-0 z-50 flex h-11 w-full max-w-[480px] items-center justify-center bg-white text-black">
        {hasBackButton && <div className="absolute left-0">{<BackButton />}</div>}
        {title && <h1 className="text-base font-semibold text-black">{title}</h1>}
      </header>
      <div className="h-full pt-11">{children}</div>
      {hasBottomNav && <BottomNav type={navType} />}
    </div>
  );
};

export default BasicLayout;
