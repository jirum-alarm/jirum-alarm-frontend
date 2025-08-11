import DeviceSpecific from '@/components/layout/DeviceSpecific';

import MobileBackgroundHeader from './mobile/BackgroundHeader';
import MobileHomeHeader from './mobile/HomeHeader';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const renderMobile = () => {
    return (
      <>
        <MobileHomeHeader />
        <MobileBackgroundHeader />
      </>
    );
  };

  return (
    <>
      <DeviceSpecific mobile={renderMobile} />
      {children}
    </>
  );
}
