'use client';

import dynamic from 'next/dynamic';
import { GA_TRACKING_ID } from '@/constants/ga';
import Mixpanel from '@/components/Mixpanel';

const GoogleAnalytics = dynamic(() => import('./GoogleAnalitics'), {
  ssr: false,
  loading: () => null,
});

export default function Analytics() {
  return (
    <>
      <GoogleAnalytics GA_TRACKING_ID={GA_TRACKING_ID} />
      <Mixpanel />
    </>
  );
}
