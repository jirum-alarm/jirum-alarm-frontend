import BottomNav from '@/shared/ui/layout/BottomNav';
import TopButton from '@/shared/ui/TopButton';

import DesktopGNB from '@/widgets/layout/ui/desktop/DesktopGNB';

import { checkDevice } from '../actions/agent';
import { getAccessToken } from '../actions/token';

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
      {!isMobile && renderDesktop()}
      <div className="min-h-screen bg-white">{children}</div>
      {isMobile && renderMobile()}
      {!isMobile && (
        <>
          <div className="sticky right-0 bottom-0 left-0 z-50">
            <div className="max-w-layout-max 3xl:left-10 relative left-0 mx-auto">
              <TopButton type="scrolling-up" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DesktopReadyLayout;
