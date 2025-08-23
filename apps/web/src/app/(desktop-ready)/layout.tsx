import BottomNav from '@/components/layout/BottomNav';
import TopButton from '@/components/TopButton';

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
    return <BottomNav />;
  };

  return (
    <div className={isMobile ? '' : 'pc min-w-5xl'}>
      {isMobile ? renderMobile() : renderDesktop()}
      <div className="min-h-screen">{children}</div>
      {!isMobile && (
        <>
          <div className="sticky right-0 bottom-0 left-0 z-50">
            <div className="max-w-layout-max 3xl:left-10 relative left-0 mx-auto">
              <TopButton type="scrolling-up" />
            </div>
          </div>
          <Footer />
        </>
      )}
    </div>
  );
};

export default DesktopReadyLayout;
