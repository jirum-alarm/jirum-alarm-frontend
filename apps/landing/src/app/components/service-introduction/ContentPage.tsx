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
        'z-0 flex h-screen max-h-lvh w-full snap-start justify-center pt-56.5 pb-11 lg:pt-82',
        className,
        isLast && 'z-7',
      )}
    >
      <div className={cn('flex flex-col lg:flex-row', isLast && 'z-7 bg-gray-50')}>{children}</div>
    </div>
  );
};

const ContentImage = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <Image
      unoptimized
      src={src}
      alt={alt}
      width={460}
      height={548}
      className="max-h-[45vh] object-contain lg:max-h-none"
    />
  );
};

const ContentWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center px-5 py-6 lg:items-start lg:px-10 lg:pt-30">
      {children}
    </div>
  );
};

const ContentKeyword = ({ children }: { children: React.ReactNode }) => {
  return <p className="text-primary-700 pb-1 text-sm font-bold lg:pb-2 lg:text-base">{children}</p>;
};

const ContentTitle = ({ children }: { children: React.ReactNode }) => {
  return <h3 className="pb-2 text-lg font-bold lg:pb-4 lg:text-4xl">{children}</h3>;
};

const ContentDescription = ({ children }: { children: React.ReactNode }) => {
  return (
    <p className="text-center text-sm font-medium text-gray-600 lg:text-left lg:text-lg">
      {children}
    </p>
  );
};

Content.Image = ContentImage;
Content.Wrapper = ContentWrapper;
Content.Keyword = ContentKeyword;
Content.Title = ContentTitle;
Content.Description = ContentDescription;

export default Content;
