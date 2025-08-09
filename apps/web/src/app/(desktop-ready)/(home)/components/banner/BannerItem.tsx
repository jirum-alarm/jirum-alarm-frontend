'use client';

import Image, { StaticImageData } from 'next/image';
import { ReactNode } from 'react';

import Link from '@/features/Link';
import { cn } from '@/lib/cn';

const BannerItem = ({
  isMobile,
  href,
  title,
  description,
  image,
  className,
}: {
  isMobile: boolean;
  href: string;
  title: ReactNode;
  description: string;
  image: StaticImageData;
  className?: string;
  eventName?: string;
}) => {
  const handleClick = () => {
    // TODO: Need GTM Migration
    // mp?.track(eventName, {
    //   page: EVENT.PAGE.HOME,
    // });
  };

  return (
    <Link
      onClick={handleClick}
      className={cn(
        'flex h-full w-full items-center justify-between rounded-lg border py-3 pl-4 pr-[6px] pc:w-1/2 pc:grow pc:pl-[32px] pc:pr-[26px]',
        isMobile && 'h-[76px]',
        className,
      )}
      href={href}
      target="_blank"
    >
      <div>
        <p className="mb-[4px] font-bold text-white pc:text-[22px] [&>strong]:text-primary-300">
          {title}
        </p>
        <p className="text-[13px] text-gray-200 pc:text-base">{description}</p>
      </div>

      <div className="relative h-[56px] w-[80px] pc:h-[84px] pc:w-[120px]">
        <Image
          src={image}
          alt=""
          unoptimized
          width={isMobile ? 80 : 120}
          height={isMobile ? 56 : 84}
        />
      </div>
    </Link>
  );
};

export default BannerItem;
