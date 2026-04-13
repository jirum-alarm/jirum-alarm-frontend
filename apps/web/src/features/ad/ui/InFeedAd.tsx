'use client';

import { useDevice } from '@/shared/hooks/useDevice';

import { AD_SIZES, ADFIT_UNIT_IDS } from '../model/adConfig';

import AdSlot from './AdSlot';

interface InFeedAdProps {
  type: keyof typeof ADFIT_UNIT_IDS;
  isMobile: boolean;
  className?: string;
}

const InFeedAd = ({ type, isMobile, className }: InFeedAdProps) => {
  const { device, isHydrated } = useDevice();

  if (!isHydrated || device.isJirumAlarmApp) return null;

  const deviceType = isMobile ? 'mobile' : 'pc';
  const unitId = ADFIT_UNIT_IDS[type][deviceType];
  const size = AD_SIZES[type][deviceType];

  if (!unitId) return null;

  return <AdSlot unitId={unitId} width={size.width} height={size.height} className={className} />;
};

export default InFeedAd;
