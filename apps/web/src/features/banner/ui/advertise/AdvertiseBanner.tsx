'use client';

import { motion } from 'motion/react';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { cn } from '@/shared/lib/cn';
import Link from '@/shared/ui/Link';

import { type AdvertiseCreative, parseAdvertiseGraphic } from './advertise-graphic';
import AdvertiseGraphic from './AdvertiseGraphic';

interface AdvertiseBannerProps {
  creative: AdvertiseCreative;
  className?: string;
  priority?: boolean;
  onImpression?: (creative: AdvertiseCreative) => void;
  onClickAd?: (creative: AdvertiseCreative) => void;
}

export default function AdvertiseBanner({
  creative,
  className,
  priority,
  onImpression,
  onClickAd,
}: AdvertiseBannerProps) {
  const graphic = parseAdvertiseGraphic(creative.graphic);
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });

  useEffect(() => {
    if (inView) onImpression?.(creative);
  }, [creative, inView, onImpression]);

  if (!graphic) return null;

  return (
    <Link
      ref={ref}
      href={creative.targetUrl}
      target="_blank"
      className={cn(
        'relative block w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100',
        className,
      )}
      aria-label={creative.displayTitle ?? creative.internalId}
      onClick={() => onClickAd?.(creative)}
    >
      <motion.div whileTap={{ scale: 0.98 }} transition={{ duration: 0.1 }}>
        <AdvertiseGraphic graphic={graphic} priority={priority} />
      </motion.div>
      <div className="bg-opacity-90 absolute right-2 bottom-2 z-30 rounded-[8px] border border-white bg-[#98A2B3] px-[7px] py-[3px] text-xs leading-none font-medium text-white">
        AD
      </div>
    </Link>
  );
}
