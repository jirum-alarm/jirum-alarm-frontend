import { QueryClient } from '@tanstack/react-query';

import BottomNav from '@/components/layout/BottomNav';
import DeviceSpecific from '@/components/layout/DeviceSpecific';
import TopButton from '@/components/TopButton';

import { AuthQueriesServer } from '@entities/auth';

import { checkDevice } from '../actions/agent';
import { getAccessToken } from '../actions/token';

import DesktopGNB from './components/desktop/DesktopGNB';
import Footer from './components/desktop/Footer';

const DesktopReadyLayout = async ({ children }: { children: React.ReactNode }) => {
  const { isMobile } = await checkDevice();
  const accessToken = await getAccessToken();

  const renderDesktop = () => {
    return <DesktopGNB isLoggedIn={!!accessToken} />;
  };

  const renderMobile = () => {
    return <BottomNav type={''} />;
  };

  return (
    <div className={isMobile ? '' : 'pc min-w-5xl'}>
      <DeviceSpecific desktop={renderDesktop} mobile={renderMobile} />
      <div className="min-h-screen">{children}</div>
      <DeviceSpecific
        desktop={() => (
          <>
            <div className="sticky right-0 bottom-0 left-0 z-50">
              <div className="max-w-layout-max 3xl:left-10 relative left-0 mx-auto">
                <TopButton type="scrolling-up" />
              </div>
            </div>
            <Footer />
          </>
        )}
      />
    </div>
  );
};

export default DesktopReadyLayout;
