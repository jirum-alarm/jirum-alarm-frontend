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
  /**
   * 알림 목록을 마지막으로 열어본 시각(ms). 이보다 나중에 온 미읽음 알림에만
   * 배경 강조를 준다 — web `gr-alarm-last-read-at` 과 같은 역할.
   */
  ALARM_LAST_READ_AT: 'alarmLastReadAt',
  /** 로그인 뒤 알림 권한 안내 시트를 이미 보여줬는지. 한 번만 — 다음부터는 키워드 등록 때 묻는다. */
  PUSH_PREPROMPT_SHOWN: 'pushPrePromptShown',
  /** 마지막으로 "새 버전이 나왔어요" 를 권한 latestVersion. 버전당 한 번만 권한다. */
  UPDATE_OFFERED_VERSION: 'updateOfferedVersion',
  /** 내정보 > 화면 모드('system' | 'light' | 'dark'). 없으면 시스템 설정. */
  COLOR_SCHEME: 'colorScheme',
} as const;
