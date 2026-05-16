'use client';

import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';

import { AuthService } from '@/shared/api/auth';
import { generateDeviceId } from '@/shared/lib/device-id';

const DEVICE_ID_KEY = 'jirum-alarm-device-id';
const DEVICE_ID_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const setDeviceIdCookie = (deviceId: string) => {
  const parts = [
    `${DEVICE_ID_KEY}=${deviceId}`,
    'Path=/',
    `Max-Age=${DEVICE_ID_COOKIE_MAX_AGE}`,
    'SameSite=Lax',
  ];
  if (window.location.protocol === 'https:') {
    parts.push('Secure');
  }
  document.cookie = parts.join('; ');
};

const readDeviceIdCookie = (): string | null => {
  const match = document.cookie.match(/(?:^|;\s*)jirum-alarm-device-id=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

export const DeviceId = () => {
  const { mutate } = useMutation({
    mutationFn: AuthService.addUserDevice,
  });

  useEffect(() => {
    const syncDeviceId = () => {
      // cookie가 진실의 소스 — middleware가 항상 먼저 set함.
      // localStorage는 백워드 호환을 위해 유지.
      const cookieDeviceId = readDeviceIdCookie();
      const localDeviceId = localStorage.getItem(DEVICE_ID_KEY);
      const isNewDevice = !cookieDeviceId && !localDeviceId;
      const deviceId = cookieDeviceId ?? localDeviceId ?? generateDeviceId();

      if (deviceId !== localDeviceId) {
        localStorage.setItem(DEVICE_ID_KEY, deviceId);
      }
      if (deviceId !== cookieDeviceId) {
        setDeviceIdCookie(deviceId);
      }
      if (isNewDevice) {
        mutate({ deviceId });
      }
    };
    syncDeviceId();
  }, [mutate]);

  return null;
};
