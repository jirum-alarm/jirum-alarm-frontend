import { QueryClient } from '@tanstack/react-query';

import BottomNav from '@/components/layout/BottomNav';
import DeviceSpecific from '@/components/layout/DeviceSpecific';
import TopButton from '@/components/TopButton';
import { AuthQueriesServer } from '@/entities/auth';

import { checkDevice } from '../actions/agent';

import DesktopGNB from './components/desktop/DesktopGNB';
import Footer from './components/desktop/Footer';

const DesktopLayout = async ({ children }: { children: React.ReactNode }) => {
  const { isMobile } = await checkDevice();
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(AuthQueriesServer.me());

  return (
    <div className={isMobile ? '' : 'pc min-w-[1024px]'}>
      <DeviceSpecific
        desktop={
          <>
            <DesktopGNB />
          </>
        }
        mobile={<BottomNav type={''} />}
      />
      {children}
      {isMobile ? null : (
        <>
          <div className="sticky bottom-0 left-0 right-0 z-50">
            <div className="relative left-0 mx-auto max-w-screen-layout-max 3xl:left-10">
              <TopButton type="scrolled" />
            </div>
          </div>
          <Footer />
        </>
      )}
    </div>
  );
};

export default DesktopLayout;
