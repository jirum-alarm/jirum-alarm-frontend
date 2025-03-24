import GoogleAnalytics from './GoogleAnalitics';
import { InitMixpanel } from '@/lib/mixpanel';

export function Analytics({ GA_TRACKING_ID }: { GA_TRACKING_ID: string }) {
  return (
    <>
      <GoogleAnalytics GA_TRACKING_ID={GA_TRACKING_ID} />
      <InitMixpanel />
    </>
  );
}
