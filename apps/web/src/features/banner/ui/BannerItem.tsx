'use client';

import { adLabel } from '@jirum/design-system/recipes';
import * as m from 'motion/react-m';
import Image, { StaticImageData } from 'next/image';
import { MouseEvent, ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import Link from '@/shared/ui/Link';

const BannerItem = ({
  isMobile,
  href,
  title,
  description,
  image,
  className,
  isAd,
  priority,
  onClick,
  newTab = true,
}: {
  isMobile: boolean;
  href: string;
  title: ReactNode;
  description: string | ReactNode;
  image: StaticImageData | string;
  className?: string;

  eventName?: string;
  isAd?: boolean;
  priority?: boolean;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  /** 외부(광고·카톡) 배너는 새 탭. 서비스 안 페이지로 가는 배너는 false. */
  newTab?: boolean;
}) => {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    // TODO: Need GTM Migration
    // mp?.track(eventName, {
    //   page: EVENT.PAGE.HOME,
    // });
  };

  return (
    <Link
      onClick={handleClick}
      className={cn(
        'pc:w-1/2 pc:grow pc:pl-8 pc:pr-6.5 relative flex h-full w-full items-center justify-between rounded-lg border py-3 pr-1.5 pl-4',
        isMobile && 'h-[92px]',
        className,
      )}
      href={href}
      target={newTab ? '_blank' : undefined}
      data-google-vignette={isAd ? 'false' : undefined}
    >
      <m.div
        className="flex h-full w-full items-center justify-between"
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
      >
        <div>
          <p className="pc:text-22 [&>strong]:text-primary-300 text-fixed-white mb-1 font-bold">
            {title}
          </p>
          <p className="pc:text-base text-fixed-200 text-13">{description}</p>
        </div>

        <div className="pc:h-[84px] pc:w-[120px] relative flex h-14 w-20 items-center justify-center">
          <Image
            src={image}
            alt=""
            priority={priority}
            sizes={isMobile ? '80px' : '120px'}
            width={isMobile ? 80 : 120}
            height={isMobile ? 56 : 84}
          />
        </div>
      </m.div>

      {isAd && (
        <div className={cn(adLabel.box, adLabel.text, 'absolute right-2 bottom-2 z-30 w-fit')}>
          AD
        </div>
      )}
    </Link>
  );
};

export default BannerItem;
