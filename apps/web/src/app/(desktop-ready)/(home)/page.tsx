import { Suspense } from 'react';

import withCheckDevice from '@/components/hoc/withCheckDevice';

import AddFCMToken from './components/AddFCMToken';
import HomeContainerV2 from './components/HomeContainerV2';
// import { getFeatureFlag } from '../actions/posthog';

const HomeContainerHOC = withCheckDevice(HomeContainerV2);

export default async function Home() {
  // const { flags } = await getFeatureFlag();

  return (
    <>
      <Suspense>
        <AddFCMToken />
      </Suspense>
      <HomeContainerHOC />
    </>
  );
}
