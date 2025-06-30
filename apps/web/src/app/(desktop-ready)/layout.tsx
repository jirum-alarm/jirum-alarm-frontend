import { QueryClient } from '@tanstack/react-query';

import BottomNavServer from '@/components/layout/BottomNavServer';
import DeviceSpecific from '@/components/layout/DeviceSpecific';
import TopButton from '@/components/TopButton';
import { AuthQueriesServer } from '@/entities/auth';

import DesktopGNB from './components/desktop/DesktopGNB';

const DesktopLayout = async ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(AuthQueriesServer.me());

  return (
    <>
      <DeviceSpecific
        desktop={
          <>
            <DesktopGNB />
            <div className="fixed bottom-0 left-0 right-0 z-50">
              <div className="relative left-0 mx-auto max-w-screen-layout-max 3xl:left-10">
                <TopButton />
              </div>
            </div>
          </>
        }
        mobile={<BottomNavServer />}
      />
      {children}
    </>
  );
};

export default DesktopLayout;
