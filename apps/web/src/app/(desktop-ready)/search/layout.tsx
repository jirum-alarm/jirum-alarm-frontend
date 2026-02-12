import { checkDevice } from '@/app/actions/agent';

import DesktopSearchLayout from '@/widgets/search/ui/layout/DesktopSearchLayout';
import MobileSearchLayout from '@/widgets/search/ui/layout/MobileSearchLayout';

export default async function SearchLayout({ children }: { children: React.ReactNode }) {
  const { isMobile } = await checkDevice();

  if (isMobile) {
    return <MobileSearchLayout>{children}</MobileSearchLayout>;
  }

  return <DesktopSearchLayout>{children}</DesktopSearchLayout>;
}
