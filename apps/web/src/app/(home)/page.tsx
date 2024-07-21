import AddFCMToken from './components/AddFCMToken';
import HomeContainer from './components/HomeContainer';
import HomeContainerV2 from './components/(home)/HomeContainerV2';
import { getFeatureFlag } from '../actions/posthog';

export default async function Home() {
  const { flags } = await getFeatureFlag();

  return (
    <>
      <AddFCMToken />
      {flags.MAIN_PAGE_RENEWAL_FEATURE ? <HomeContainerV2 /> : <HomeContainer />}
    </>
  );
}
