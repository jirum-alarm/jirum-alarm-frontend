export const StorageKey = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  FCM_DEVICE_TOKEN: 'fcmDeviceToken',
  /** 조회 수집용 사용자 식별자. web localStorage 의 jirum-alarm-device-id 와 같은 값. */
  DEVICE_ID: 'deviceId',
  /** 최근 본 상품(웹뷰 홈이 읽던 것을 네이티브가 대신 쌓는다). */
  RECENT_VIEWED_PRODUCTS: 'recentViewedProducts',
} as const;
