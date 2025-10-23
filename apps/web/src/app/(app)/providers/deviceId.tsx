'use client';

import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';

import { AuthService } from '@/shared/api/auth';
import { generateDeviceId } from '@/shared/lib/device-id';

export const DeviceId = () => {
  const { mutate } = useMutation({
    mutationFn: AuthService.addUserDevice,
  });

  useEffect(() => {
    const getOrCreateDeviceId = () => {
      const deviceId = localStorage.getItem('jirum-alarm-device-id');

      if (!deviceId) {
        const newDeviceId = generateDeviceId();
        localStorage.setItem('jirum-alarm-device-id', newDeviceId);
        mutate({ deviceId: newDeviceId });
      }
    };

    getOrCreateDeviceId();
  }, [mutate]);

  return null;
};
