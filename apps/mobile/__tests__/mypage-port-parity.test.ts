export {};

/**
 * 내정보 탭 네이티브 전환 — **"안 옮긴 것"을 잡는 대조 테스트.**
 *
 * 이 레포의 이식 실패는 "잘못 옮김"보다 "안 옮김"이 압도적으로 많고
 * (native-port-omissions-user-caught, 5회 재발) 타입·스크린샷은 **존재하는
 * 코드만** 본다. 그래서 web 소스와 앱 소스를 둘 다 읽어 "web 에 있으면 앱에도
 * 있다"를 검사한다(`__tests__/home-view-more.test.ts` 와 같은 방식).
 * web 이 바뀌면 이 테스트가 깨져서 알려준다.
 */

const fs = require('fs');
const path = require('path');

declare const __dirname: string;

const read = (p: string) =>
  fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const readWeb = (p: string) =>
  fs.readFileSync(path.join(__dirname, '../../web/src', p), 'utf8');

/** 라우트 13개 ↔ 화면 파일. 이름을 규칙으로 만들지 않고 명시한다(오타가 곧 버그다). */
const SCREEN_FILES: Record<string, string> = {
  root: 'src/screens/mypage/MyPageScreen.tsx',
  account: 'src/screens/mypage/AccountScreen.tsx',
  nickname: 'src/screens/mypage/NicknameScreen.tsx',
  personal: 'src/screens/mypage/PersonalScreen.tsx',
  password: 'src/screens/mypage/PasswordScreen.tsx',
  categories: 'src/screens/mypage/CategoriesScreen.tsx',
  keyword: 'src/screens/mypage/KeywordScreen.tsx',
  terms: 'src/screens/mypage/TermsPoliciesScreen.tsx',
  policy: 'src/screens/mypage/PolicyScreen.tsx',
  like: 'src/screens/mypage/LikeScreen.tsx',
  themes: 'src/screens/mypage/ThemesScreen.tsx',
  themeDetail: 'src/screens/mypage/ThemeDetailScreen.tsx',
};

const SCREENS: Record<string, string> = Object.fromEntries(
  Object.entries(SCREEN_FILES).map(([name, file]) => [name, read(file)]),
);

const ALL_SCREEN_SOURCES = Object.values(SCREENS).join('\n');

/**
 * 주석을 뗀 코드만 남긴다.
 * ⚠️"web 의 X 는 안 옮긴다" 같은 **주석 낱말에 걸려 거짓 양성**이 난다 —
 * 실제로 `isMobile`·`text-gray-400` 두 건에서 겪었다(런북에도 같은 경고가 있다).
 */
const stripComments = (source: string) =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter(line => !/^\s*(\/\/|\*)/.test(line))
    .join('\n');

const FEATURE_FILES = [
  'src/features/mypage/ui/StackHeader.tsx',
  'src/features/mypage/ui/Rows.tsx',
  'src/features/mypage/ui/ConfirmModal.tsx',
  'src/features/mypage/ui/PasswordField.tsx',
  'src/features/mypage/ui/PriceDropSwitch.tsx',
  'src/features/mypage/ui/CategoryCheckboxGroup.tsx',
  'src/features/mypage/ui/GenderRadioGroup.tsx',
  'src/features/mypage/ui/BirthYearSelect.tsx',
  'src/features/mypage/ui/ThemeCards.tsx',
  'src/features/mypage/ui/CustomerServiceSheet.tsx',
];
const ALL_FEATURE_SOURCES = FEATURE_FILES.map(read).join('\n');
const ALL_SOURCES = `${ALL_SCREEN_SOURCES}\n${ALL_FEATURE_SOURCES}`;
const ALL_CODE = stripComments(ALL_SOURCES);

describe('라우트 13개가 전부 있다 — 절반만 네이티브면 같은 화면이 두 벌로 보인다', () => {
  it.each(Object.entries(SCREENS))(
    '%s 화면 파일이 존재하고 default export 다',
    (_name, source) => {
      expect(source).toMatch(/export default function|export default \w/);
    },
  );

  it('탭 루트는 MyPageScreen 이다(web /mypage)', () => {
    expect(SCREENS.root).toContain('마이페이지');
    expect(SCREENS.root).toContain('export default function MyPageScreen');
  });
});

describe('메뉴 — web MenuList 의 5줄이 전부 있다', () => {
  const web = readWeb('features/mypage/ui/MenuList.tsx');

  /**
   * ⚠️`toContain('찜 목록')` 처럼 **낱말만** 보면 안 된다 — 이 파일 주석에
   * 메뉴 5개 이름이 나열돼 있어서, 행을 지워도 통과한다(되돌려 실패시키는
   * 확인에서 실제로 걸렸다). `title="..."` **속성 형태**로 못박는다.
   */
  const rootCode = stripComments(SCREENS.root);

  it.each([
    ['찜 목록', 'LIKE'],
    ['관심 카테고리', 'MYPAGE_CATEGORIES'],
    ['키워드 알림', 'MYPAGE_KEYWORD'],
    ['약관 및 정책', 'MYPAGE_TERMS'],
  ])('"%s" 이 web 에 있고 앱에서 %s 로 간다', (title, route) => {
    expect(web).toContain(title);
    expect(rootCode).toContain(`title="${title}"`);
    expect(rootCode).toContain(route);
  });

  /**
   * ★고객센터(채널톡)는 web SDK 라 네이티브에 얹을 데가 없다 →
   * 네이티브 껍데기 안에 web 페이지를 띄운다. **행 자체가 사라지면**
   * 유저는 문의 창구를 잃는다.
   */
  it('"고객센터" 행이 있고 채널톡 시트를 연다', () => {
    expect(web).toContain('고객센터');
    expect(rootCode).toContain('title="고객센터"');
    expect(rootCode).toContain('setCustomerServiceOpen(true)');
    expect(rootCode).toContain('<CustomerServiceSheet');
  });
});

describe('가입 정보 — web AccountContainer 의 4줄 + 계정 관리 2개', () => {
  const web = readWeb('features/mypage/ui/account/AccountContainer.tsx');

  it.each(['닉네임', '개인정보', '비밀번호', '이메일 주소'])(
    '"%s" 줄이 web·앱 양쪽에 있다',
    label => {
      expect(web).toContain(label);
      expect(SCREENS.account).toContain(label);
    },
  );

  it('로그아웃·회원탈퇴 버튼이 둘 다 있다(하나만 옮기기 쉬운 자리)', () => {
    expect(SCREENS.account).toContain('로그아웃');
    expect(SCREENS.account).toContain('회원탈퇴');
    expect(SCREENS.account).toContain('useLogout');
    expect(SCREENS.account).toContain('useWithdraw');
  });

  it('둘 다 확인창을 거친다 — web AlertDialog 대응(바로 실행하면 사고다)', () => {
    const logout = readWeb('features/mypage/ui/account/Logout.tsx');
    const remove = readWeb('features/mypage/ui/account/DeleteAccount.tsx');
    expect(logout).toContain('AlertDialog');
    expect(remove).toContain('AlertDialog');
    expect(SCREENS.account.match(/<ConfirmModal/g) ?? []).toHaveLength(2);
  });

  it('web 문구를 그대로 쓴다', () => {
    expect(SCREENS.account).toContain('로그아웃 시 알림을 받을 수 없어요.');
    expect(SCREENS.account).toContain('회원탈퇴 시 모든 계정 정보가 삭제돼요.');
  });
});

describe('키워드 화면 — web 이 한 화면에서 관리하는 3덩어리', () => {
  const webPage = readWeb('app/(mobile)/mypage/keyword/page.tsx');

  it('web 페이지가 입력·구독묶음·목록 3개를 렌더한다(전제 확인)', () => {
    expect(webPage).toContain('KeywordInput');
    expect(webPage).toContain('MySubscribedThemes');
    expect(webPage).toContain('KeywordList');
  });

  it('앱도 3개를 다 그린다', () => {
    expect(SCREENS.keyword).toContain('키워드를 입력해주세요.');
    expect(SCREENS.keyword).toContain('구독한 묶음');
    expect(SCREENS.keyword).toContain('나의 지름 키워드');
  });

  /**
   * ★키워드별 토글이다(유저 전역이 아니다). 이걸 빠뜨리면 web 에서 켠 설정을
   * 앱에서 볼 수도 끌 수도 없다.
   */
  it('가격 하락 알림 토글이 있다', () => {
    const webToggle = readWeb(
      'features/mypage/ui/keyword/PriceDropOnlyToggle.tsx',
    );
    expect(webToggle).toContain('가격 하락 알림');
    expect(read('src/features/mypage/ui/PriceDropSwitch.tsx')).toContain(
      '가격 하락 알림',
    );
    expect(SCREENS.keyword).toContain('PriceDropSwitch');
  });

  it('묶음 더보기 링크가 있다(web MySubscribedThemes)', () => {
    const webThemes = readWeb(
      'features/mypage/ui/theme/MySubscribedThemes.tsx',
    );
    expect(webThemes).toContain('묶음 더보기');
    expect(SCREENS.keyword).toContain('묶음 더보기');
  });
});

describe('묶음(테마) — 목록·상세의 조각이 다 있다', () => {
  it('목록: 설명문 + 구독 버튼 + 대표 키워드 미리보기', () => {
    const web = readWeb('features/mypage/ui/theme/ThemeList.tsx');
    expect(web).toContain('representativeKeywords');
    expect(SCREENS.themes).toContain(
      '관심 묶음을 구독하면 그 안의 키워드 딜이 뜰 때 알림을 받아요.',
    );
    expect(read('src/features/mypage/ui/ThemeCards.tsx')).toContain(
      'representativeKeywords',
    );
    expect(read('src/features/mypage/ui/ThemeCards.tsx')).toContain('구독중');
  });

  it('상세: 포함 키워드 + 라이브 딜 + 구독 토글', () => {
    const web = readWeb('features/mypage/ui/theme/ThemeDetail.tsx');
    expect(web).toContain('포함 키워드');
    expect(web).toContain('지금 이 묶음에 뜬 딜');
    expect(SCREENS.themeDetail).toContain('포함 키워드');
    expect(SCREENS.themeDetail).toContain('지금 이 묶음에 뜬 딜');
    expect(SCREENS.themeDetail).toContain('이 묶음 구독');
    expect(SCREENS.themeDetail).toContain('지금은 뜬 딜이 없어요.');
  });

  it('구독은 낙관적 업데이트다 — 무효화만 하면 "눌러도 그대로"가 된다(web 주석)', () => {
    const app = read('src/features/mypage/model/useThemeSubscription.ts');
    expect(app).toContain('onMutate');
    expect(app).toContain('setQueryData');
    // 롤백이 없으면 실패해도 구독한 것처럼 남는다.
    expect(app).toContain('rollback');
  });
});

describe('찜 목록 — web /like', () => {
  it('전체 개수 줄이 있다', () => {
    const web = readWeb(
      'app/(mobile)/like/components/ProductLikeContainer.tsx',
    );
    expect(web).toContain('wishlistCount');
    expect(SCREENS.like).toContain('전체 ');
    expect(SCREENS.like).toContain('count');
  });

  it('카드마다 찜 해제 하트가 있다(web ProductLikeAction)', () => {
    const web = readWeb('app/(mobile)/like/components/ProductLikeGridList.tsx');
    expect(web).toContain('actionIcon');
    expect(SCREENS.like).toContain('WishlistHeart');
    // 실제 해제 뮤테이션은 뷰모델이 쥐고 있다.
    expect(read('src/features/mypage/model/useWishlistViewModel.ts')).toContain(
      'removeWishlist',
    );
  });

  it('무한스크롤이 있다(web useInView 센티넬 → onEndReached)', () => {
    expect(SCREENS.like).toContain('onEndReached');
  });
});

describe('약관 — web 두 문서로 갈린다', () => {
  it('목차 두 줄이 각각 다른 문서로 간다', () => {
    const web = readWeb('app/(mobile)/mypage/terms-policies/page.tsx');
    expect(web).toContain('서비스 이용약관');
    expect(web).toContain('개인정보 처리방침');
    expect(SCREENS.terms).toContain('서비스 이용약관');
    expect(SCREENS.terms).toContain('개인정보 처리방침');
    expect(SCREENS.terms).toContain("{kind: 'terms'}");
    expect(SCREENS.terms).toContain("{kind: 'privacy'}");
  });

  /**
   * ★본문은 web 페이지를 띄운다(법무 문서 479줄을 복사하면 drift 가 법적 위험).
   * ⚠️`StackWebView` 가 이미 PRESS_BACKBUTTON 으로 goBack 하므로 화면이 pop 을
   * 또 하면 **두 번 pop 되어 탭 밖으로 튄다**(런북). 그 실수를 못박는다.
   */
  it('웹뷰 껍데기이고, 화면이 직접 pop 하지 않는다', () => {
    expect(SCREENS.policy).toContain('StackWebView');
    expect(SCREENS.policy).toContain('/policies/privacy');
    expect(SCREENS.policy).toContain('/policies/terms');
    expect(SCREENS.policy).not.toMatch(/navigation\.goBack\(\)/);
    expect(SCREENS.policy).not.toMatch(/navigation\.pop\(/);
  });
});

describe('옮기면 안 되는 web 분기 — 옮기면 영원히 안 뜨는 죽은 코드다', () => {
  /**
   * 앱은 `isJirumAlarmApp` 이 항상 참이고 `RootNavigator` 가 앱 전체를 로그인
   * 뒤에 둔다. 그래서 비로그인 유도(`useRedirectIfNotLoggedIn` → ROUTE_CHANGED)는
   * 이 화면들에 도달할 수 없다.
   */
  it('web 묶음 화면엔 비로그인 유도가 있다(전제 확인)', () => {
    expect(readWeb('features/mypage/ui/theme/ThemeList.tsx')).toContain(
      'useRedirectIfNotLoggedIn',
    );
    expect(readWeb('features/mypage/ui/theme/ThemeDetail.tsx')).toContain(
      'useRedirectIfNotLoggedIn',
    );
  });

  it('앱엔 그 분기가 없다', () => {
    expect(ALL_CODE).not.toContain('checkAndRedirect');
    expect(ALL_CODE).not.toContain('useRequireLogin');
  });

  it('PC 전용 분기(isMobile)도 안 옮긴다', () => {
    expect(readWeb('app/(desktop-ready)/themes/page.tsx')).toContain(
      'isMobile',
    );
    expect(ALL_CODE).not.toContain('isMobile');
  });
});

describe('★디자인 점검 2026-09-09 — 고친 것이 되돌아가지 않게', () => {
  it('로그아웃·회원탈퇴는 justify-end 로 하단에 붙인다', () => {
    // 🔴web `flex items-end justify-center` 를 그대로 옮기면 안 된다.
    // web 은 flex-direction:row 라 items-end 가 **하단**이지만 RN 기본은
    // column 이라 우측 정렬 + 수직 가운데가 된다(실측 653pt, 창 874pt).
    const code = stripComments(SCREENS.account);
    expect(code).toContain('justify-end');
    expect(code).not.toContain('items-end justify-center');
  });

  it('폼 CTA 하단 여백은 FORM_CTA_BOTTOM 한 곳에서 정한다', () => {
    // 화면마다 리터럴을 쓰면 같은 저장 버튼이 다섯 높이에 앉는다
    // (실측 54.3 / 54.3 / 58.3 / 32.0 / 20.3pt, safe area 는 34pt).
    for (const file of [
      'src/screens/mypage/NicknameScreen.tsx',
      'src/screens/mypage/PasswordScreen.tsx',
      'src/screens/mypage/PersonalScreen.tsx',
      'src/screens/mypage/CategoriesScreen.tsx',
      'src/screens/mypage/KeywordScreen.tsx',
      'src/screens/mypage/AccountScreen.tsx',
    ]) {
      expect(read(file)).toContain('FORM_CTA_BOTTOM');
    }
    // KeyboardStickyView 가 없는 화면은 safe area 를 직접 더해야 한다 —
    // 안 더하면 CTA 가 홈 인디케이터 안으로 들어간다.
    for (const file of [
      'src/screens/mypage/PersonalScreen.tsx',
      'src/screens/mypage/CategoriesScreen.tsx',
      'src/screens/mypage/AccountScreen.tsx',
    ]) {
      const code = stripComments(read(file));
      expect(code).not.toContain('KeyboardStickyView');
      expect(code).toContain('FORM_CTA_BOTTOM + insets.bottom + bottomClip');
    }
  });

  it('이동하는 행은 chevron 을 갖는다', () => {
    const rows = read('src/features/mypage/ui/Rows.tsx');
    // MenuRow · MovePageRow · TextRow 세 곳 모두.
    expect(rows.match(/<ArrowRight \/>/g)?.length).toBe(3);
  });

  it('구분선은 한 굵기 — 목록 꼬리 구분선은 두지 않는다', () => {
    const code = stripComments(SCREENS.root);
    expect(code).not.toContain('border-b-2');
    expect(code).not.toContain('border-gray-300');
  });

  it('묶음 상세 헤더는 묶음 이름이다 — 목록과 같은 제목이면 구분이 안 된다', () => {
    expect(
      stripComments(read('src/screens/mypage/ThemeDetailScreen.tsx')),
    ).toContain("title={theme?.name ?? '알림 묶음'}");
  });

  it('카테고리 저장은 0개 선택이면 비활성', () => {
    expect(
      stripComments(read('src/screens/mypage/CategoriesScreen.tsx')),
    ).toContain('selected.size === 0');
  });

  it('"가격 하락 알림" 은 행마다 반복하지 않는다', () => {
    // 키워드가 20개면 같은 문구가 20번 반복돼 정작 키워드가 안 읽힌다.
    expect(stripComments(SCREENS.keyword)).toContain('showLabel={false}');
  });

  it('고객센터는 상담창이 뜨면 네이티브 헤더를 접는다 — 닫기 2개 방지', () => {
    // 채널톡이 자체 헤더(✕)와 하단 탭을 갖고 있다. web 은 `onShowMessenger()`
    // 로 채널톡만 띄워 크롬이 하나다 — 그쪽에 맞춘다.
    // ⚠️로딩 중에는 브릿지가 없으므로 네이티브 ✕ 를 남긴다(20초 타임아웃).
    const sheet = read('src/features/mypage/ui/CustomerServiceSheet.tsx');
    const header = sheet.slice(
      sheet.indexOf('{!isReady ? ('),
      sheet.indexOf('<View style={styles.body}>'),
    );
    expect(header).toContain('고객센터');
    expect(header).toContain('<Close />');
  });
});

describe('레포 함정 가드', () => {
  /**
   * 🔴`PressableScale` 에 크기 클래스를 주면 바깥 Pressable 폭이 0 이 되어
   * **통째로 안 보인다**(3번 재발). 판정은 폭/높이가 0 인가.
   */
  it('PressableScale 에 flex/width/height className 을 주지 않는다', () => {
    const matches =
      ALL_CODE.match(/<PressableScale[^>]*className="[^"]*"/g) ?? [];
    matches.forEach(tag => {
      expect(tag).not.toMatch(/className="[^"]*\b(flex-1|w-full|h-full)\b/);
    });
  });

  /** NativeWind 4 는 Animated.* 의 className 을 조용히 무시한다. */
  it('Animated.* 에 className 을 주지 않는다', () => {
    expect(ALL_CODE).not.toMatch(/<Animated\.[A-Za-z]+[^>]*className=/);
  });

  /**
   * 🔴web 의 `h-22`·`pt-22`·`h-6.5` 는 Tailwind **v4** 임의 값이다.
   * 앱은 v3 라 그런 클래스가 **조용히 무시된다** — 값을 그대로 베끼면 안 된다.
   */
  it('tailwind v3 에 없는 클래스를 베껴오지 않았다', () => {
    expect(ALL_CODE).not.toMatch(
      /\b(h|w|pt|pb|py|mt|mb)-(22|13|15|17|18|19|21|23)\b/,
    );
    expect(ALL_CODE).not.toMatch(/\bh-6\.5\b/);
    // web 에 실제로 있는, 존재하지 않는 클래스
    expect(ALL_CODE).not.toContain('text-semibold');
  });

  /**
   * 회색 텍스트는 gray-400(2.58:1, AA 미달) 대신 gray-500.
   * 예외는 **placeholder** 뿐이다 — 선택 전 출생년도는 입력창의 placeholder 와
   * 같은 자리이고, 레포 `TextField` 도 `placeholderTextColor='#98A2B3'`(gray-400)
   * 를 쓴다. 여기만 다른 색이면 형제 입력들과 어긋나 보인다.
   */
  it('placeholder 를 뺀 텍스트에 text-gray-400 을 쓰지 않는다', () => {
    const GRAY_400_ALLOWED = 'src/features/mypage/ui/BirthYearSelect.tsx';
    const files = [...Object.values(SCREEN_FILES), ...FEATURE_FILES].filter(
      file => file !== GRAY_400_ALLOWED,
    );

    files.forEach(file => {
      expect(stripComments(read(file))).not.toContain('text-gray-400');
    });
  });
});

describe('데이터 계층', () => {
  it('키워드 상한이 web(20)과 같다', () => {
    const web = readWeb('features/mypage/ui/keyword/KeywordList.tsx');
    expect(web).toContain('<span>20</span>');
    expect(read('src/entities/mypage/mypage.queries.ts')).toContain(
      'MAX_KEYWORD_COUNT = 20',
    );
  });

  it('찜 목록 페이지 크기가 web(18)과 같다', () => {
    const web = readWeb(
      'app/(mobile)/like/components/ProductLikeContainer.tsx',
    );
    expect(web).toContain('LIMIT = 18');
    expect(read('src/entities/mypage/mypage.queries.ts')).toContain(
      'WISHLIST_PAGE_SIZE = 18',
    );
  });

  /** 관심 카테고리는 발견 탭 칩 줄(categoriesForUser)도 같이 무효화해야 한다. */
  it('카테고리 저장이 CategoryQueries 도 무효화한다(web update-category 와 같다)', () => {
    const web = readWeb('features/mypage/model/update-category.ts');
    expect(web).toContain('CategoryQueries');
    expect(read('src/features/mypage/model/mutations.ts')).toContain(
      'CategoryQueries',
    );
  });
});
