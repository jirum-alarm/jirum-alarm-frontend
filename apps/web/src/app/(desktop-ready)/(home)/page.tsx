import DeviceSpecific from '@/components/layout/DeviceSpecific';

import AddFCMToken from './components/AddFCMToken';
import HomeContainerV2 from './components/HomeContainerV2';
// import { getFeatureFlag } from '../actions/posthog';

export default async function Home() {
  // const { flags } = await getFeatureFlag();

  return (
    <>
      <AddFCMToken />
      <DeviceSpecific
        mobile={<HomeContainerV2 isMobile={true} />}
        desktop={<HomeContainerV2 isMobile={false} />}
      />
    </>
  );
}
