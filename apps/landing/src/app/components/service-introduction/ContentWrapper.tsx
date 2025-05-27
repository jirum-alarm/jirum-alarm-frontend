import Image from 'next/image';

import { cn } from '@/shared/libs/cn';

const Content = ({
  children,
  className,
  isLast,
}: {
  children: React.ReactNode;
  className?: string;
  isLast?: boolean;
}) => {
  return (
    <div
      className={cn(
        'h-mobile-height lg:h-desktop-height z-0 flex w-full snap-center snap-always items-center justify-center pt-50',
        className,
        isLast && 'z-7',
      )}
    >
      <div className={cn('flex', isLast && 'z-7 bg-gray-50')}>{children}</div>
    </div>
  );
};

const ContentImage = ({ src, alt }: { src: string; alt: string }) => {
  return <Image src={src} alt={alt} width={460} height={548} />;
};

const ContentWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className="pt-30">{children}</div>;
};

const ContentKeyword = ({ children }: { children: React.ReactNode }) => {
  return <p className="text-primary-700 pb-2 font-bold">{children}</p>;
};

const ContentTitle = ({ children }: { children: React.ReactNode }) => {
  return <h3 className="pb-4 text-4xl font-bold">{children}</h3>;
};

const ContentDescription = ({ children }: { children: React.ReactNode }) => {
  return <p className="text-lg font-medium text-gray-600">{children}</p>;
};

Content.Image = ContentImage;
Content.Wrapper = ContentWrapper;
Content.Keyword = ContentKeyword;
Content.Title = ContentTitle;
Content.Description = ContentDescription;

export default Content;
