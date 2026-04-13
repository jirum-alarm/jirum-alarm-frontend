'use client';

import { AD_SIZES, ADFIT_UNIT_IDS } from '../model/adConfig';

import AdSlot from './AdSlot';

interface InFeedAdProps {
  type: keyof typeof ADFIT_UNIT_IDS;
  isMobile: boolean;
  className?: string;
}

const InFeedAd = ({ type, isMobile, className }: InFeedAdProps) => {
  const device = isMobile ? 'mobile' : 'pc';
  const unitId = ADFIT_UNIT_IDS[type][device];
  const size = AD_SIZES[type][device];

  if (!unitId) return null;

  return <AdSlot unitId={unitId} width={size.width} height={size.height} className={className} />;
};

export default InFeedAd;
