import { PAGE } from '@/shared/config/page';
import { Alert, Description, Filter, Heart, Setting } from '@/shared/ui/common/icons';

/** PC 사이드바·첫 화면의 묶음. 자주 여는 것(내 핫딜) → 가끔 바꾸는 것(맞춤 설정) → 거의 안 여는 것(지원) 순. */
export const MYPAGE_GROUPS = [
  { key: 'mine', label: '내 핫딜' },
  { key: 'custom', label: '맞춤 설정' },
  { key: 'support', label: '지원' },
] as const;

/** 마이페이지 메뉴. 모바일 목록(MenuList)·PC 사이드바·PC 첫 화면 카드가 같은 목록을 쓴다.
 *  pcOnly: 모바일엔 따로 길이 있는 것(알림 = 바텀 탭). PC 는 GNB 아이콘뿐이라 마이페이지 메뉴로 묶는다.
 *  group: PC 만 묶어 보여준다 — 모바일 목록은 항목이 적어 순서 그대로. */
export const MYPAGE_MENU: Array<{
  icon: React.ReactNode;
  title: string;
  url: string;
  /** PC 첫 화면 카드에만 보인다. */
  description: string;
  group: (typeof MYPAGE_GROUPS)[number]['key'];
  pcOnly?: boolean;
}> = [
  {
    icon: <Alert />,
    title: '알림',
    group: 'mine',
    url: PAGE.ALARM,
    description: '받은 핫딜 알림을 모아봐요',
    pcOnly: true,
  },
  {
    icon: (
      <div className="flex h-7 w-7 items-center justify-center">
        <Heart width={24} height={24} />
      </div>
    ),
    title: '찜 목록',
    group: 'mine',
    url: PAGE.LIKE,
    description: '찜한 핫딜을 모아봐요',
  },
  {
    icon: <Filter />,
    title: '관심 카테고리',
    group: 'custom',
    url: PAGE.MYPAGE_CATEGORIES,
    description: '관심사를 최대 5개까지 골라요',
  },
  {
    icon: <Alert />,
    title: '키워드 알림',
    group: 'custom',
    url: PAGE.MYPAGE_KEYWORD,
    description: '원하는 상품이 올라오면 알려드려요',
  },
  {
    icon: <Setting />,
    title: '알림 설정',
    group: 'custom',
    url: '/mypage/notification',
    description: '알림 종류·야간 알림을 켜고 꺼요',
  },
  {
    icon: <Description />,
    title: '약관 및 정책',
    group: 'support',
    url: PAGE.MYPAGE_TERMS_POLICIES,
    description: '이용약관·개인정보 처리방침',
  },
];
