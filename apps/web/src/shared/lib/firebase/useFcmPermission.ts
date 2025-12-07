'use client';

import { getApps, initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';
import { useCallback } from 'react';

import { setFcmToken as setFcmTokenAction } from '@/app/actions/token';

import { TokenType } from '@shared/api/gql/graphql';
import { NotificationService } from '@shared/api/notification/notification.service';
import { firebaseConfig } from '@shared/config/firebase';

const COOLDOWN_KEY = 'fcm-permission-cooldown';
const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

function getFirebaseApp() {
  const apps = getApps();
  return apps.length ? apps[0] : initializeApp(firebaseConfig);
}

export function useFcmPermission() {
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return { granted: false as const };

    // Cooldown for denied/ignored prompts
    const cooldown = localStorage.getItem(COOLDOWN_KEY);
    if (cooldown && Date.now() - Number(cooldown) < COOLDOWN_MS) {
      return { granted: false as const };
    }

    Notification.requestPermission().then((permission) => {
      if (permission !== 'granted') {
        localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
        return { granted: false as const };
      }

      const messaging = getMessaging(getFirebaseApp());
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

      getToken(messaging, { vapidKey }).then((token) => {
        try {
          if (token) {
            // 쿠키 저장 및 서버 등록
            setFcmTokenAction(token);
            NotificationService.addPushToken({ token, tokenType: TokenType.Fcm });
          }
        } catch (e) {
          console.error('FCM getToken error', e);
        }
      });
    });
  }, []);

  return { requestPermission };
}
