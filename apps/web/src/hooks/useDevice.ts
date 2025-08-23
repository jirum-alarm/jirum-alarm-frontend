'use client';

import { useQuery } from '@tanstack/react-query';

import { checkDevice } from '@/app/actions/agent';

export const useDevice = (initialIsMobile: boolean = false) => {
  const { data, isLoading } = useQuery({
    queryKey: ['device'],
    queryFn: async () => await checkDevice(),
    initialData: {
      isMobile: initialIsMobile,
      isSafari: false,
      isJirumAlarmIOSApp: false,
      isJirumAlarmAndroidApp: false,
      isJirumAlarmApp: false,
      isApple: false,
      isAndroid: false,
      isMobileBrowser: initialIsMobile,
    },
  });

  return { ...data, isLoading };
};
