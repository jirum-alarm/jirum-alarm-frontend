import AddFCMToken from './components/AddFCMToken';
import HomeContainer from './components/HomeContainer';
import HomeContainerV2 from './components/(home)/HomeContainerV2';
// import { getFeatureFlag } from '../actions/posthog';
import { IS_VERCEL_PRD } from '@/constants/env';
import { Suspense } from 'react';

export default function Home() {
  // const { flags } = await getFeatureFlag();

  return (
    <>
      <AddFCMToken />
      {/* {flags.MAIN_PAGE_RENEWAL_FEATURE ? <HomeContainerV2 /> : <HomeContainer />} */}

      <HomeContainerV2 />

      {/* @TODO: remove afeter v1.1.0 QA */}
      {/* {!IS_VERCEL_PRD ? ( */}
      {/*   <HomeContainerV2 /> */}
      {/* ) : ( */}
      {/*   <Suspense> */}
      {/*     <HomeContainer /> */}
      {/*   </Suspense> */}
      {/* )} */}
    </>
  );
}
