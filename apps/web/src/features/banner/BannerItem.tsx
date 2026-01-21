'use client';

import { motion } from 'motion/react';
import Image, { StaticImageData } from 'next/image';
import { ReactNode } from 'react';

import { cn } from '@/lib/cn';

import Link from '@shared/ui/Link';

const BannerItem = ({
  isMobile,
  href,
  title,
  description,
  image,
  className,
  isAd,
  priority,
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
        'pc:w-1/2 pc:grow pc:pl-[32px] pc:pr-6.5 relative flex h-full w-full items-center justify-between rounded-lg border py-3 pr-[6px] pl-4',
        isMobile && 'h-[92px]',
        className,
      )}
      href={href}
      target="_blank"
    >
      <motion.div
        className="flex h-full w-full items-center justify-between"
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
      >
        <div>
          <p className="pc:text-[22px] [&>strong]:text-primary-300 mb-[4px] font-bold text-white">
            {title}
          </p>
          <p className="pc:text-base text-[13px] text-gray-200">{description}</p>
        </div>

        <div className="pc:h-[84px] pc:w-[120px] relative flex h-14 w-[80px] items-center justify-center">
          <Image
            src={image}
            alt=""
            priority={priority}
            sizes={isMobile ? '80px' : '120px'}
            width={isMobile ? 80 : 120}
            height={isMobile ? 56 : 84}
          />
        </div>
      </motion.div>

      {isAd && (
        <div className="bg-opacity-90 absolute right-[8px] bottom-[8px] z-30 w-fit rounded-[8px] border border-white bg-[#98A2B3] px-[7px] py-[3px] text-xs leading-none font-medium text-white">
          AD
        </div>
      )}
    </Link>
  );
};

export default BannerItem;
