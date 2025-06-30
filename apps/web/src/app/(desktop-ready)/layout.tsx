import BottomNavServer from '@/components/layout/BottomNavServer';
import DeviceSpecific from '@/components/layout/DeviceSpecific';
import TopButton from '@/components/TopButton';

import DesktopGNB from './components/desktop/DesktopGNB';

const DesktopLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <DeviceSpecific
        desktop={
          <>
            <DesktopGNB />
            <div className="fixed bottom-0 left-0 right-0 z-50">
              <div className="relative left-10 mx-auto max-w-screen-layout-max">
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
