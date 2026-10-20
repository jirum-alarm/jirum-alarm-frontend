export const StorageKey = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  FCM_DEVICE_TOKEN: 'fcmDeviceToken',
  /** 기기 식별자(X-Device-Id). 게스트 계정·푸시 토큰 회수·조회 수집이 이걸로 기기를 가른다. */
  DEVICE_ID: 'deviceId',
  /** 게스트(로그인 없이 알림만 받는 기기 계정)로 들어와 있는지. 실제 로그인·로그아웃 때 지운다. */
  IS_GUEST: 'isGuest',
  /**
   * 이 기기에 세션(회원·게스트)이 한 번이라도 있었는지. 없으면 첫 실행이라 로그인 화면 대신
   * 게스트로 바로 들어간다 — 로그아웃·세션 만료·게스트 나가기 뒤엔 로그인 화면이 맞으므로 이 값으로 가른다.
   */
  SESSION_EVER: 'sessionEver',
  /** 최근 본 상품(웹뷰 홈이 읽던 것을 네이티브가 대신 쌓는다). */
  RECENT_VIEWED_PRODUCTS: 'recentViewedProducts',
  /** 로그인 전에 하려던 동작. 로그인 복귀 후 한 번만 실행한다. */
  PENDING_LOGIN_ACTION: 'pendingLoginAction',
  /** 오카방 입장 클릭 후 soft/구매후 권유 재노출 방지. web `jirum:okachat-joined` 와 같은 역할. */
  OKACHAT_JOINED: 'okachatJoined',
  /** 뷰티 핫딜 방 입장 기록 — 방마다 따로 둔다(web `jirum:okachat-joined:beauty`). */
  OKACHAT_JOINED_BEAUTY: 'okachatJoined:beauty',
  /**
   * 알림 목록을 마지막으로 열어본 시각(ms). 이보다 나중에 온 미읽음 알림에만
   * 배경 강조를 준다 — web `gr-alarm-last-read-at` 과 같은 역할.
   */
  ALARM_LAST_READ_AT: 'alarmLastReadAt',
  /** 로그인 뒤 알림 권한 안내 시트를 이미 보여줬는지. 한 번만 — 다음부터는 키워드 등록 때 묻는다. */
  PUSH_PREPROMPT_SHOWN: 'pushPrePromptShown',
  /** 첫 실행 「이런 거 싸게 뜨면 알려드릴까요?」 시트를 이미 보여줬는지(FirstAlertSheet). 한 번만. */
  FIRST_ALERT_SHOWN: 'firstAlertShown',
  /** 마지막으로 "새 버전이 나왔어요" 를 권한 latestVersion. 버전당 한 번만 권한다. */
  UPDATE_OFFERED_VERSION: 'updateOfferedVersion',
  /** 내정보 > 화면 모드('system' | 'light' | 'dark'). 없으면 시스템 설정. */
  COLOR_SCHEME: 'colorScheme',
  /** 앱을 쓴 날(KST 'YYYY-MM-DD', 최근 30개) — 스토어 평점은 여러 날 쓴 사람에게만 묻는다(store-review). */
  REVIEW_ACTIVE_DAYS: 'reviewActiveDays',
  /** 마지막으로 OS 평점 시트를 띄운 시각(ms). */
  REVIEW_REQUESTED_AT: 'reviewRequestedAt',
} as const;
