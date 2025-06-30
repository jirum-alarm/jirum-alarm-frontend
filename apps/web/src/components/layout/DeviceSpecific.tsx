import { ReactNode } from 'react';

import { checkDevice } from '@/app/actions/agent';

interface DeviceSpecificProps {
  mobile?: ReactNode;
  desktop?: ReactNode;
}

export default async function DeviceSpecific({ mobile, desktop }: DeviceSpecificProps) {
  const { isMobile } = await checkDevice();
  return <>{isMobile ? mobile : desktop}</>;
}
