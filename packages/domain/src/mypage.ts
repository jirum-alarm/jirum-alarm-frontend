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

/** 가입 정보 화면 — 줄 이름·로그아웃/탈퇴 확인창의 경고 한 줄(web AlertDialog·앱 ConfirmSheet). */
export const ACCOUNT_COPY = {
  nickname: '닉네임',
  personal: '개인정보',
  password: '비밀번호',
  email: '이메일 주소',
  logoutWarning: '로그아웃 시 알림을 받을 수 없어요.',
  withdrawWarning: '회원탈퇴 시 모든 계정 정보가 삭제돼요.',
} as const;

/**
 * 관심사(테마) 알림 — 소개·버튼·고르는 조건 문구. 조건 카드의 숫자(상위 7%·하루 3건·발송 시각)는 서버 발송 규칙과
 * 같은 말이어야 해서 한쪽만 바뀌면 두 플랫폼이 다른 말을 한다.
 */
export const THEME_COPY = {
  intro:
    '관심사를 고르면 키워드를 하나하나 등록하지 않아도, 반응 좋은 핫딜만 하루 최대 3건 보내드려요.',
  mySubscribedTitle: '받고 있는 관심사 알림',
  browseMore: '더 둘러보기',
  subscribedShort: '받는 중',
  subscribedToggle: '알림 받는 중 · 끄기',
  criteriaTitle: '이렇게 골라서 보내드려요',
  criteriaKeywords: (count: number) => `키워드 ${count}개 중 하나라도 제목에 있으면`,
  criteriaQuality: '조회·추천·댓글이 몰린 커뮤니티 상위 약 7% 딜만 골라요.',
  criteriaSchedule: '오전 10시 · 오후 2시 · 오후 8시에 그때 가장 좋은 딜 1건씩.',
  criteriaSkip: '키워드 알림이나 앞선 시간에 이미 받은 딜은 건너뛰고 다음 딜로.',
  criteriaExcludeRoundups: '여러 상품을 늘어놓은 모음 글, 사은품 문구에만 키워드가 걸린 딜은 빼요.',
  criteriaExcludeWords: '이런 단어가 들어간 딜도 빼요',
} as const;

/** 약관 두 문서 — 목차 이름과 web 주소(앱은 같은 web 페이지를 웹뷰로 띄운다 — 법무 문서를 복사하지 않는다). */
export const POLICY_DOCS = {
  terms: { title: '서비스 이용약관', path: '/policies/terms' },
  privacy: { title: '개인정보 처리방침', path: '/policies/privacy' },
} as const;
