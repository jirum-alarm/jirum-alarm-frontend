import HomeContainerV2 from './components/(home)/HomeContainerV2';
import AddFCMToken from './components/AddFCMToken';
// import { getFeatureFlag } from '../actions/posthog';

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
