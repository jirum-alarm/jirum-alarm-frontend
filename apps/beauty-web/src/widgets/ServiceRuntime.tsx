'use client';

import { useEffect } from 'react';

import { addUserDevice } from '@/shared/api/client';
import { GTM_ID } from '@/shared/config/gtm';
import { syncDeviceId } from '@/shared/lib/device-id';
import { isProductionHostname, isServiceHostname } from '@/shared/lib/service-host';

const loadGtm = () => {
  if (document.getElementById('gtm')) return;
  const script = document.createElement('script');
  script.id = 'gtm';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(script);
};

/**
 * 페이지 밖 일(화면 없음): 기기 ID 맞추기 + GTM 붙이기.
 * - 기기 ID: web DeviceId 와 같은 키·같은 첫 방문 등록(addUserDevice). 지름알림 도메인에서만.
 * - GTM: 운영 도메인에서만, load 이후(web 은 next/script lazyOnload — LCP 창에 139KB 가 끼지 않게).
 */
export default function ServiceRuntime() {
  useEffect(() => {
    const { hostname } = window.location;
    if (isServiceHostname(hostname)) {
      const { deviceId, isNew } = syncDeviceId();
      if (isNew) addUserDevice(deviceId);
    }

    if (!isProductionHostname(hostname)) return;
    if (document.readyState === 'complete') {
      loadGtm();
      return;
    }
    window.addEventListener('load', loadGtm, { once: true });
    return () => window.removeEventListener('load', loadGtm);
  }, []);

  return null;
}
