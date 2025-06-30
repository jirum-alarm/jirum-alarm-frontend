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
        'flex h-full w-full items-center justify-between rounded-lg border py-3 lg:w-1/2 lg:grow',
        className,
        {
          'pl-[16px] pr-[6px]': isMobile,
          'pl-[32px] pr-[26px]': !isMobile,
        },
      )}
      href={href}
      target="_blank"
    >
      <div>
        <p
          className={cn('mb-[4px] font-bold text-white [&>strong]:text-primary-300', {
            'text-base': isMobile,
            'text-[22px]': !isMobile,
          })}
        >
          {title}
        </p>
        <p className={cn(['text-gray-200', isMobile ? 'text-[13px]' : 'text-base'])}>
          {description}
        </p>
      </div>

      <div
        className={cn('relative', {
          'h-[59px] w-[91px]': isMobile,
          'h-[80px] w-[116px]': !isMobile,
        })}
      >
        <Image
          src={image}
          alt=""
          unoptimized
          width={isMobile ? 91 : 116}
          height={isMobile ? 59 : 80}
        />
      </div>
    </Link>
  );
};

export default BannerItem;
