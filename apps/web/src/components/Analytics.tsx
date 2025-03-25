'use client';

import { GA_TRACKING_ID } from '@/constants/ga';
import GoogleAnalytics from '@/components/GoogleAnalitics';
import Mixpanel from '@/components/Mixpanel';

export default function Analytics() {
  return (
    <>
      <GoogleAnalytics GA_TRACKING_ID={GA_TRACKING_ID} />
      <Mixpanel />
    </>
  );
}
