export const firebaseConfig = {
  apiKey: 'AIzaSyCpfnPqj8e_uVFTASlpumCYJ9w7R3d-8wQ',
  authDomain: 'jirumalarm-b25f9.firebaseapp.com',
  projectId: 'jirumalarm-b25f9',
  storageBucket: 'jirumalarm-b25f9.appspot.com',
  messagingSenderId: '570660841537',
  appId: '1:570660841537:web:f7b68d980e7a30daffbec0',
};

/**
 * 웹 푸시 VAPID 공개키 — 진짜 키처럼 생긴 값만 쓰고, 아니면 undefined(= Firebase SDK 기본 VAPID 키).
 *
 * 2025-08 부터 배포 설정이 이 자리에 Firebase **API 키**(AIza…)를 넣어 왔다. 브라우저는 그 값으로 푸시 구독을
 * 거부해("applicationServerKey is not valid") 웹 푸시 토큰이 1년 넘게 한 개도 정상 발급되지 않았다
 * (2026-10-11 실측: 같은 크롬에서 API 키 → 실패, 키 없음 → 정상 토큰). VAPID 공개키는 P-256 점(65바이트)의
 * base64url 이라 'B' 로 시작하는 87자 안팎이다.
 */
export const webPushVapidKey = (
  value: string | undefined = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
) => (value && /^B[A-Za-z0-9_-]{80,}={0,2}$/.test(value) ? value : undefined);
