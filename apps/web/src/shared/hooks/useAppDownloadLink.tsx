'use client';

import { CheckDeviceResult } from '@/app/actions/agent.types';

import {
  ANDROID_STORE_LINK as GooglePlayLink,
  IOS_STORE_LINK as AppStoreLink,
} from '@/shared/config/appStore';

const useAppDownloadLink = (device: CheckDeviceResult) => {
  if (!device) {
    return { type: null, link: null } as const;
  }

  if (!device.isMobileBrowser) {
    return { type: null, link: null } as const;
  }

  if (device.isApple) {
    return { type: 'apple', link: AppStoreLink } as const;
  }

  if (device.isAndroid) {
    return { type: 'android', link: GooglePlayLink } as const;
  }

  return { type: null, link: null } as const;
};

export default useAppDownloadLink;
