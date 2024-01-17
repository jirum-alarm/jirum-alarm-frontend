import React from 'react';
import BackButton from './BackButton';

interface Props {
  children: React.ReactNode;
  title?: string;
  hasBackButton?: boolean;
}

const BasicLayout = ({ children, title, hasBackButton }: Props) => {
  return (
    <div className="relative mx-auto grid min-h-screen max-w-[480px] bg-white">
      <header className="fixed top-0 z-50 flex h-11 w-full max-w-[480px] items-center justify-center bg-white text-black">
        {hasBackButton && <div className="absolute left-0">{<BackButton />}</div>}
        {title && <h1 className="text-base font-semibold text-black">{title}</h1>}
      </header>
      <div className="h-full pt-14">{children}</div>
    </div>
  );
};

export default BasicLayout;
