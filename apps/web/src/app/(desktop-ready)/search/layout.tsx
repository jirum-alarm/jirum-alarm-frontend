import { checkDevice } from '@/app/actions/agent';

import DesktopSearchLayout from './desktop/SearchLayout';
import MobileSearchLayout from './mobile/SearchLayout';

export default async function SearchLayout({ children }: { children: React.ReactNode }) {
  const { isMobile } = await checkDevice();

  if (isMobile) {
    return <MobileSearchLayout>{children}</MobileSearchLayout>;
  }

  return <DesktopSearchLayout>{children}</DesktopSearchLayout>;
}
