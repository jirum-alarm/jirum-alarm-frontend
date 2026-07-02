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
      // localStorage 가 진실의 소스 — 한번 자리잡으면 안정적으로 보존된다.
      // 미들웨어가 굽는 쿠키(crypto.randomUUID v4)는 첫 방문에 같은 요청 cookies() 로
      // 안 보여 매 요청 새로 발급되는 불안정 값이라 진실로 믿으면 안 된다(계측 붕괴 원인).
      // 따라서 우선순위: localStorage > cookie. localStorage 값을 쿠키로 동기화한다.
      const localDeviceId = localStorage.getItem(DEVICE_ID_KEY);
      const cookieDeviceId = readDeviceIdCookie();
      const isNewDevice = !localDeviceId && !cookieDeviceId;
      const deviceId = localDeviceId ?? cookieDeviceId ?? generateDeviceId();

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
