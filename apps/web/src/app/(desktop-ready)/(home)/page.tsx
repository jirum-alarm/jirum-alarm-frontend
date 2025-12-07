import { Suspense } from 'react';

import AddFCMToken from '@features/alarm/ui/AddFCMToken';

import HomeContainerV2 from '@widgets/home/ui/HomeContainerV2';
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
