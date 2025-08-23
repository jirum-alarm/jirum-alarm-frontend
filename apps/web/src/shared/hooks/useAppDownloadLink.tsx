'use client';

import { CheckDeviceResult } from '@/app/actions/agent.types';

const GooglePlayLink = 'https://play.google.com/store/apps/details?id=com.solcode.jirmalam';
const AppStoreLink =
  'https://apps.apple.com/sg/app/%EC%A7%80%EB%A6%84%EC%95%8C%EB%A6%BC/id6474611420';

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
