/**
 * 마이페이지(앱 「내정보」) 메뉴 — 항목·이름·묶음·순서의 정본.
 *
 * web(모바일 목록·PC 사이드바·PC 첫 화면 카드)과 앱 MyPageScreen 이 이 목록을 그대로 돈다.
 * 각 앱은 key 마다 아이콘·이동만 `Record<키, …>` 로 붙이므로, 여기 항목을 늘리면 두 앱 타입체크가
 * «이 메뉴를 어디로 보낼지»를 요구한다 — 한쪽에만 메뉴가 생기는 «안 옮김»이 컴파일에서 막힌다.
 * (전엔 앱 테스트가 web menu.tsx 를 문자열로 읽어 대조했다 — 파일이 옮겨질 때마다 깨졌다, 2026-10-20 정본화)
 *
 * 순서: 자주 여는 것(내 핫딜) → 가끔 바꾸는 것(맞춤 설정) → 거의 안 여는 것(지원).
 * 키워드 알림이 가장 자주 여는 설정이라 맞춤 설정 맨 위.
 */

export const MYPAGE_GROUPS = [
  { key: 'mine', label: '내 핫딜' },
  { key: 'custom', label: '맞춤 설정' },
  { key: 'support', label: '지원' },
] as const;

export type MypageGroupKey = (typeof MYPAGE_GROUPS)[number]['key'];

export type MypageMenuItem = {
  key: string;
  title: string;
  group: MypageGroupKey;
  /** PC 첫 화면 카드에만 보인다. */
  description: string;
  /** PC 에서만 — 모바일 web·앱엔 따로 길(하단 탭)이 있다. */
  pcOnly?: boolean;
};

export const MYPAGE_MENU = [
  {
    key: 'alarm',
    title: '알림',
    group: 'mine',
    description: '받은 핫딜 알림을 모아봐요',
    pcOnly: true,
  },
  { key: 'like', title: '찜 목록', group: 'mine', description: '찜한 핫딜을 모아봐요' },
  {
    key: 'keyword',
    title: '키워드 알림',
    group: 'custom',
    description: '원하는 상품이 올라오면 알려드려요',
  },
  {
    key: 'categories',
    title: '관심 카테고리',
    group: 'custom',
    description: '관심사를 최대 5개까지 골라요',
  },
  {
    key: 'notification',
    title: '알림 설정',
    group: 'custom',
    description: '알림 종류·야간 알림을 켜고 꺼요',
  },
  {
    key: 'help',
    title: '사용법 · 자주 묻는 질문',
    group: 'support',
    description: '지름알림을 잘 쓰는 법',
  },
  {
    key: 'terms',
    title: '약관 및 정책',
    group: 'support',
    description: '이용약관·개인정보 처리방침',
  },
] as const satisfies readonly MypageMenuItem[];

export type MypageMenuKey = (typeof MYPAGE_MENU)[number]['key'];

/** 모바일(web 모바일·앱) 목록에 나오는 메뉴 키 — PC 전용(알림) 제외. */
export type MypageMobileMenuKey = Exclude<
  MypageMenuKey,
  Extract<(typeof MYPAGE_MENU)[number], { pcOnly: true }>['key']
>;

/** 묶음 하나의 모바일 목록(PC 전용 제외, 정본 순서). */
export const mobileMenuOf = (group: MypageGroupKey) =>
  MYPAGE_MENU.filter(
    (item): item is Extract<(typeof MYPAGE_MENU)[number], { key: MypageMobileMenuKey }> =>
      item.group === group && !('pcOnly' in item && item.pcOnly),
  );

/** 키워드 상한 — 키워드 화면의 `n/20` 과 목록 조회 크기. */
export const MAX_KEYWORD_COUNT = 20;

/** 찜 목록 한 페이지 크기(무한 스크롤). */
export const WISHLIST_PAGE_SIZE = 18;

/** 채널톡 상담 — 지원 묶음 맨 끝. 이동이 아니라 상담창을 여는 버튼이라 메뉴 목록과 따로 둔다. */
export const CUSTOMER_SERVICE_TITLE = '고객센터';
