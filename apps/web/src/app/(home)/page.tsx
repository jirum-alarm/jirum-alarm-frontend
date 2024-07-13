import AddFCMToken from './components/AddFCMToken';
import HomeContainer from './components/HomeContainer';
import HomeContainerV2 from './components/(home)/HomeContainerV2';
import { getFeatureFlag } from '../actions/posthog';
import { IS_VERCEL_PRD } from '@/constants/env';

export default async function Home() {
  const { flags } = await getFeatureFlag();

  return (
    <>
      <AddFCMToken />
      {!IS_VERCEL_PRD && flags.MAIN_PAGE_RENEWAL_FEATURE ? <HomeContainerV2 /> : <HomeContainer />}
      {/* <HomeContainer /> */}
    </>
  );
}
