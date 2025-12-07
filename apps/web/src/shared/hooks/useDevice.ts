'use client';

import { useAtom } from 'jotai';
import { useEffect } from 'react';

import { deviceAtom, getDeviceInfo } from '@/shared/model/device';

import { useIsHydrated } from './useIsHydrated';

export const useDevice = () => {
  const isHydrated = useIsHydrated();

  const [device, setDevice] = useAtom(deviceAtom);

  useEffect(() => {
    if (isHydrated) {
      setDevice(getDeviceInfo());
    }
  }, [setDevice, isHydrated]);

  return { device, isHydrated };
};
