import { Suspense } from 'react';

import AddFCMToken from './components/AddFCMToken';
import HomeContainerV2 from './components/HomeContainerV2';
// import { getFeatureFlag } from '../actions/posthog';

export default async function Home() {
  // const { flags } = await getFeatureFlag();

  return (
    <>
      <Suspense>
        <AddFCMToken />
      </Suspense>
      <HomeContainerV2 />
    </>
  );
}
