import { ComponentType } from 'react';

import { checkDevice } from '@/app/actions/agent';

const withCheckDevice = <T extends { isMobile?: boolean }>(Component: ComponentType<T>) => {
  const WrappedComponent = async (props: Omit<T, 'isMobile'>) => {
    const { isMobile } = await checkDevice();
    return <Component {...(props as T)} isMobile={isMobile} />;
  };

  WrappedComponent.displayName = `CheckDeviceHOC(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
};

export default withCheckDevice;
