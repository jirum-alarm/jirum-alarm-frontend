'use client';

import { useEffect, useState } from 'react';

import { APP_QR_PATH } from '@/shared/config/appStore';
import { useFcmPermission } from '@/shared/lib/firebase/useFcmPermission';
import { isInApp } from '@/shared/lib/webview';

type PushStatus = 'unknown' | 'ok' | 'unsupported' | 'denied' | 'default';

const readStatus = (): PushStatus => {
  if (isInApp()) return 'ok'; // 앱은 네이티브 토큰으로 받는다
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'ok';
  return Notification.permission;
};

/**
 * 키워드를 걸어도 이 브라우저로는 푸시가 안 오는 상태면 알려준다.
 *
 * 2026-10-01 실측: 키워드 유저 472명 중 푸시 토큰 보유 51명. 나머지는 알림센터에만 쌓였고
 * 읽힌 건 16.7만 건 중 18건 — 유저는 알림을 받는 줄 알고 있었다. iOS 사파리는 홈 화면에
 * 추가하지 않으면 웹 푸시 API 자체가 없고, 거부한 브라우저는 다시 묻지 않는다.
 */
const PushStatusBanner = () => {
  const [status, setStatus] = useState<PushStatus>('unknown');
  const { requestPermission } = useFcmPermission();

  useEffect(() => setStatus(readStatus()), []);

  if (status === 'unknown' || status === 'ok') return null;

  const handleEnable = async () => {
    await requestPermission({ force: true });
    setStatus(readStatus());
  };

  return (
    <div className="mb-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
      <p className="font-medium text-gray-900">지금은 키워드 알림이 휴대폰으로 오지 않아요</p>
      {status === 'default' && (
        <>
          <p className="mt-1 text-xs text-gray-500">브라우저 알림을 켜면 바로 받아볼 수 있어요.</p>
          <button
            type="button"
            onClick={handleEnable}
            className="bg-primary-500 mt-3 rounded-md px-4 py-2 text-sm font-semibold text-gray-900"
          >
            알림 켜기
          </button>
        </>
      )}
      {status === 'denied' && (
        <p className="mt-1 text-xs text-gray-500">
          이 브라우저에서 알림이 차단돼 있어요. 주소창의 사이트 설정에서 알림을 허용하거나, 앱을
          설치해 주세요.
        </p>
      )}
      {status === 'unsupported' && (
        <p className="mt-1 text-xs text-gray-500">
          이 브라우저는 푸시 알림을 지원하지 않아요(아이폰 사파리는 홈 화면에 추가해야 해요). 앱을
          설치하면 바로 받아볼 수 있어요.
        </p>
      )}
      {status !== 'default' && (
        // 스토어 분기 리다이렉트(UA) 라우트라 클라이언트 라우팅(next/link) 말고 일반 이동.
        <a
          href={APP_QR_PATH}
          className="bg-primary-500 mt-3 inline-block rounded-md px-4 py-2 text-sm font-semibold text-gray-900"
        >
          앱 설치하기
        </a>
      )}
    </div>
  );
};

export default PushStatusBanner;
