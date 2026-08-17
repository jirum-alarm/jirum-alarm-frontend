export const StorageKey = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  FCM_DEVICE_TOKEN: 'fcmDeviceToken',
  /** 조회 수집용 사용자 식별자. web localStorage 의 jirum-alarm-device-id 와 같은 값. */
  DEVICE_ID: 'deviceId',
  /** 최근 본 상품(웹뷰 홈이 읽던 것을 네이티브가 대신 쌓는다). */
  RECENT_VIEWED_PRODUCTS: 'recentViewedProducts',
  /** 로그인 전에 하려던 동작. 로그인 복귀 후 한 번만 실행한다. */
  PENDING_LOGIN_ACTION: 'pendingLoginAction',
  /** 오카방 입장 클릭 후 soft/구매후 권유 재노출 방지. web `jirum:okachat-joined` 와 같은 역할. */
  OKACHAT_JOINED: 'okachatJoined',
} as const;
