import { MYPAGE_MENU as MENU, type MypageMenuItem, type MypageMenuKey } from '@jirum/domain/mypage';

import { PAGE } from '@/shared/config/page';
import { Alert, Description, Grid, Hashtag, Heart, Help, Setting } from '@/shared/ui/common/icons';

/** 묶음·항목·이름·순서의 정본은 @jirum/domain/mypage(앱 MyPageScreen 과 같은 목록). 여기선 web 아이콘·주소만 붙인다. */
export { MYPAGE_GROUPS } from '@jirum/domain/mypage';

const WEB_MENU: Record<MypageMenuKey, { icon: React.ReactNode; url: string }> = {
  alarm: { icon: <Alert />, url: PAGE.ALARM },
  like: {
    icon: (
      <div className="flex h-7 w-7 items-center justify-center">
        <Heart width={24} height={24} />
      </div>
    ),
    url: PAGE.LIKE,
  },
  keyword: { icon: <Hashtag />, url: PAGE.MYPAGE_KEYWORD },
  categories: { icon: <Grid />, url: PAGE.MYPAGE_CATEGORIES },
  notification: { icon: <Setting />, url: '/mypage/notification' },
  help: { icon: <Help />, url: PAGE.HELP },
  terms: { icon: <Description />, url: PAGE.MYPAGE_TERMS_POLICIES },
};

/** 마이페이지 메뉴. 모바일 목록(MenuList)·PC 사이드바·PC 첫 화면 카드가 같은 목록을 쓴다.
 *  pcOnly: 모바일엔 따로 길이 있는 것(알림 = 바텀 탭). PC 는 GNB 아이콘뿐이라 마이페이지 메뉴로 묶는다. */
export const MYPAGE_MENU: Array<
  Omit<MypageMenuItem, 'key'> & { icon: React.ReactNode; url: string }
> = MENU.map(({ key, ...item }) => ({ ...item, ...WEB_MENU[key] }));
