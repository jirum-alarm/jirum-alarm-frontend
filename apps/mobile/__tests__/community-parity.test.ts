export {};

/**
 * 커뮤니티 탭 네이티브 전환 — **web 과의 대조**.
 *
 * ★이 레포에서 이식 실패는 "잘못 옮김"보다 **"안 옮김"** 이 압도적으로 많고
 * (홈 전환 때 사용자가 누락 6건을 잡았다), tsc·lint·타입은 **존재하는 코드만**
 * 본다. 그래서 여기서는 web 디렉토리를 **런타임에 훑어서** 대응이 없는 파일을
 * 실패로 만든다 — web 에 새 컴포넌트가 생기면 이 테스트가 알려준다.
 */
/**
 * ★AsyncStorage 는 jest 에서 네이티브 모듈이 null 이라 import 만으로 죽는다.
 * 쿼리 모듈이 서비스 → HttpClient → AsyncStorage 를 끌고 오므로 mock 을 둔다
 * (이 레포 관행 — `__tests__/device-id-header.test.ts` 와 같은 방식).
 */
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
  removeItem: jest.fn(async () => {}),
}));

const fs = require('fs');
const path = require('path');

declare const __dirname: string;

const MOBILE = path.join(__dirname, '..');
const WEB = path.join(__dirname, '../../web/src');

const read = (p: string) => fs.readFileSync(path.join(MOBILE, p), 'utf8');
const readWeb = (p: string) => fs.readFileSync(path.join(WEB, p), 'utf8');
const exists = (p: string) => fs.existsSync(path.join(MOBILE, p));

const {getPostCardView} = require('../src/features/community/lib/post-card');

/**
 * 주석을 지운 소스. ★주석의 낱말에 걸려 거짓 양성이 나는 함정을 실제로 겪었다
 * (예: "web 은 text-gray-400 이지만..." 이라는 설명이 금지어 검사에 걸린다).
 * 금지어 검사는 **실행되는 코드**만 봐야 한다.
 */
const readCode = (p: string) =>
  read(p)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

const listScreen = read('src/screens/community/CommunityScreen.tsx');
const postScreen = read('src/screens/community/CommunityPostScreen.tsx');

/**
 * web `features/community` 파일 → 앱 대응.
 *
 * `null` 은 **의도적으로 안 옮긴 것**이고, 아래 `SKIP_REASON` 에 이유를 적는다.
 * 이유 없이 빠뜨리는 것과 구분하기 위해 두 자료를 따로 둔다.
 */
const WEB_TO_APP: Record<string, string | null> = {
  'index.ts': null,
  'lib/postContent.ts': 'src/entities/community/post-content.ts',
  'model/useCommunityViewModel.ts': 'src/screens/community/CommunityScreen.tsx',
  'model/useCommunityPostDetail.ts':
    'src/features/community/model/useCommunityPostViewModel.ts',
  'model/usePostForm.ts': null,
  'ui/TabBar.tsx': 'src/features/community/ui/CommunityTabBar.tsx',
  'ui/CommunityList.tsx': 'src/screens/community/CommunityScreen.tsx',
  'ui/CommunityPostCard.tsx': 'src/features/community/ui/CommunityPostCard.tsx',
  'ui/NoticePostCard.tsx': 'src/features/community/ui/NoticePostCard.tsx',
  'ui/NoticeAuthor.tsx': 'src/features/community/ui/NoticeAuthor.tsx',
  'ui/CommunityPostDetail.tsx':
    'src/features/community/ui/CommunityPostBody.tsx',
  'ui/CommunityPostPageHeader.tsx':
    'src/screens/community/CommunityPostScreen.tsx',
  'ui/CommunityShareButton.tsx':
    'src/screens/community/CommunityPostScreen.tsx',
  'ui/CommunityCommentSection.tsx':
    'src/features/community/ui/CommunityCommentItem.tsx',
  'ui/PostImages.tsx': 'src/features/community/ui/PostImages.tsx',
  'ui/PostMenu.tsx': 'src/features/community/ui/PostMenu.tsx',
  'ui/ReportModal.tsx': 'src/features/community/ui/ReportSheet.tsx',
  'ui/CommunityHotDeals.tsx': 'src/features/community/ui/CommunityHotDeals.tsx',
  'ui/PostForm.tsx': null,
  'ui/PostFormClient.tsx': null,
  'ui/PostImageUploader.tsx': null,
  'ui/ProductTagModal.tsx': null,
  'ui/communityCommentBottomPad.test.ts': null,
};

/** 안 옮긴 이유. "앱에서 도달 불가" 와 "web 이 담당" 을 구분해 적는다. */
const SKIP_REASON: Record<string, string> = {
  'index.ts': '배럴 파일 — 앱은 폴더 구조가 달라 대응이 없다',
  'model/usePostForm.ts': '글쓰기는 web 웹뷰가 담당(이미지 피커 미설치)',
  'ui/PostForm.tsx': '글쓰기는 web 웹뷰가 담당',
  'ui/PostFormClient.tsx': '글쓰기는 web 웹뷰가 담당',
  'ui/PostImageUploader.tsx':
    '이미지 피커(expo-image-picker)가 이 레포에 없다 — 넣으면 네이티브 재빌드',
  'ui/ProductTagModal.tsx':
    '글쓰기 안에서만 쓰인다. "최근 본 상품"이 웹뷰 localStorage 를 읽는다',
  'ui/communityCommentBottomPad.test.ts':
    'web 전용 CSS 여백 계산 테스트 — RN 에 --bottom-nav-padding 이 없다',
};

describe('web↔앱 대조표 — 빠뜨린 컴포넌트가 없나', () => {
  const webFiles: string[] = [];
  const walk = (dir: string, prefix = '') => {
    for (const entry of fs.readdirSync(
      path.join(WEB, 'features/community', dir),
      {
        withFileTypes: true,
      },
    )) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(path.join(dir, entry.name), rel);
      else webFiles.push(rel);
    }
  };
  walk('.');

  it('web features/community 의 모든 파일이 대조표에 있다', () => {
    const missing = webFiles.filter(f => !(f in WEB_TO_APP));
    // 여기서 걸리면 web 에 새 컴포넌트가 생긴 것이다 —
    // 옮길지 말지 판단해서 WEB_TO_APP(과 필요하면 SKIP_REASON)에 적을 것.
    expect(missing).toEqual([]);
  });

  it('대조표가 가리키는 앱 파일이 실제로 있다', () => {
    const broken = Object.entries(WEB_TO_APP)
      .filter(([, appPath]) => appPath !== null && !exists(appPath as string))
      .map(([webPath]) => webPath);
    expect(broken).toEqual([]);
  });

  it('안 옮긴 파일에는 전부 이유가 적혀 있다', () => {
    const noReason = Object.entries(WEB_TO_APP)
      .filter(([webPath, appPath]) => appPath === null && !SKIP_REASON[webPath])
      .map(([webPath]) => webPath);
    expect(noReason).toEqual([]);
  });

  it('web 라우트 3개가 앱 화면 3개와 짝을 이룬다', () => {
    expect(exists('src/screens/community/CommunityScreen.tsx')).toBe(true);
    expect(exists('src/screens/community/CommunityPostScreen.tsx')).toBe(true);
    expect(exists('src/screens/community/CommunityWriteScreen.tsx')).toBe(true);
  });
});

describe('목록 카드 표시 규칙 — web CommunityPostCard 와 같은 판정', () => {
  const base = {content: '본문', author: {nickname: '홍길동'}};

  it('제목 없이 상품에 달린 글은 "댓글" 뱃지다', () => {
    expect(getPostCardView({...base, productId: 3}).badgeLabel).toBe('댓글');
  });

  it('제목이 있으면 "게시글" 이다', () => {
    expect(
      getPostCardView({...base, title: '제목', productId: 3}).badgeLabel,
    ).toBe('게시글');
  });

  it('작성자가 없으면 "알 수 없음"', () => {
    expect(getPostCardView({content: '본문'}).authorName).toBe('알 수 없음');
  });

  /**
   * ★서버는 태그 없는 글에도 `taggedProduct.id = '0'` 을 채워 보낸다.
   * `!!taggedProduct` 만 보면 **모든 글에 빈 상품 카드**가 붙는다(web 이
   * 그래서 id !== '0' 를 본다).
   */
  it("taggedProduct.id 가 '0' 이면 태그 없음으로 본다", () => {
    expect(
      getPostCardView({
        ...base,
        taggedProduct: {id: '0', title: '', thumbnail: null},
      }).hasTaggedProduct,
    ).toBe(false);
  });

  it('태그 상품이 있으면 그 썸네일이 미리보기다(첨부보다 우선)', () => {
    const view = getPostCardView({
      ...base,
      content: ':::jirum-images\nhttps://cdn.jirum-alarm.com/a.jpg\n:::\n본문',
      taggedProduct: {id: '9', title: '상품', thumbnail: 'https://x/p.jpg'},
    });
    expect(view.previewImage).toBe('https://x/p.jpg');
    expect(view.showProductTitle).toBe(true);
    // 태그 상품 썸네일에는 "+N" 을 붙이지 않는다(장수와 무관한 그림이다).
    expect(view.extraImageCount).toBe(0);
  });

  it('첨부가 여러 장이면 첫 장 + "+N"', () => {
    const cdn = 'https://cdn.jirum-alarm.com';
    const view = getPostCardView({
      ...base,
      content: `:::jirum-images\n${cdn}/a.jpg\n${cdn}/b.jpg\n${cdn}/c.jpg\n:::\n본문`,
    });
    expect(view.previewImage).toBe(`${cdn}/a.jpg`);
    expect(view.extraImageCount).toBe(2);
    expect(view.displayContent).toBe('본문');
  });

  it('첨부가 없으면 미리보기가 없다(빈 회색 박스를 만들지 않는다)', () => {
    expect(getPostCardView(base).previewImage).toBeNull();
  });
});

describe('탭·섹션 상수가 web 과 같다', () => {
  it('탭 라벨·순서가 web TabBar 와 같다', () => {
    const web = readWeb('features/community/ui/TabBar.tsx');
    const webLabels = [...web.matchAll(/label: '([^']+)'/g)].map(m => m[1]);
    const app = read('src/features/community/ui/CommunityTabBar.tsx');
    const appLabels = [...app.matchAll(/label: '([^']+)'/g)].map(m => m[1]);
    expect(appLabels).toEqual(webLabels);
    expect(appLabels).toEqual(['전체', '인기', '공지']);
  });

  it('탭 필터가 web getTabFilter 와 같다', () => {
    const {
      getTabFilter,
    } = require('../src/entities/community/community.queries');
    expect(getTabFilter('all')).toEqual({});
    expect(getTabFilter('trending')).toEqual({isTrending: true});
    expect(getTabFilter('notice')).toEqual({isNotice: true});
  });

  it('핫딜 섹션 라벨·링크·순서가 web CommunityHotDeals 와 같다', () => {
    const web = readWeb('features/community/ui/CommunityHotDeals.tsx');
    const webLabels = [...web.matchAll(/label: (?:'([^']+)'|"([^"]+)")/g)].map(
      m => m[1] ?? m[2],
    );
    const webLinks = [...web.matchAll(/link: '([^']+)'/g)].map(m => m[1]);
    const app = read('src/features/community/ui/CommunityHotDeals.tsx');
    const appLabels = [...app.matchAll(/label: (?:'([^']+)'|"([^"]+)")/g)].map(
      m => m[1] ?? m[2],
    );
    const appLinks = [...app.matchAll(/link: '([^']+)'/g)].map(m => m[1]);
    expect(appLabels).toEqual(webLabels);
    expect(appLinks).toEqual(webLinks);
  });

  it('날짜 기반 선택식이 web 과 같다(같은 날 같은 섹션)', () => {
    const web = readWeb('features/community/ui/CommunityHotDeals.tsx');
    expect(web).toMatch(/getDate\(\) % RANKING_OPTIONS\.length/);
    const app = read('src/features/community/ui/CommunityHotDeals.tsx');
    expect(app).toMatch(/date\.getDate\(\) % RANKING_OPTIONS\.length/);
  });

  it('목록 정렬이 web defaultPostsVariables 와 같다', () => {
    const web = readWeb('entities/community/api/community.queries.ts');
    expect(web).toMatch(/POSTS_LIMIT = 20/);
    expect(web).toMatch(/CommentOrder\.Id/);
    const app = read('src/entities/community/community.queries.ts');
    expect(app).toMatch(/POSTS_LIMIT = 20/);
    expect(app).toMatch(/CommentOrder\.Id/);
  });

  it('목록은 루트 글만 받는다(isRoot: true) — 안 넣으면 댓글이 섞인다', () => {
    expect(read('src/graphql/community.ts')).toMatch(/isRoot: true/);
  });
});

describe('웹이 하던 일의 인수 — 조용히 사라지는 것들', () => {
  /**
   * 웹뷰 시절 탭 재탭은 `injectJavaScript("window.scrollTo(0,0)")` 였다.
   * 네이티브 탭엔 웹뷰 ref 가 없어 그 주입이 **예외도 로그도 없이 no-op** 이다
   * — 등록하지 않으면 재탭이 아무 반응 없이 끝난다.
   */
  it('탭 재탭 → 맨 위로를 store 에 등록한다', () => {
    expect(listScreen).toMatch(
      /useRegisterScrollToTop\(\s*tabNavigations\.COMMUNITY/,
    );
    expect(listScreen).toMatch(/scrollToOffset\(\{offset: 0/);
  });

  it('목록이 pull-to-refresh 로 다시 받는다', () => {
    expect(listScreen).toMatch(/RefreshControl/);
  });

  it('공유는 네이티브가 직접 처리한다(웹 브릿지 SHARE_REQUEST 대체)', () => {
    // web 은 ShareSheet → 브릿지 → event.ts 가 Share.share 를 불렀다.
    // 네이티브 화면에는 그 브릿지가 안 오므로 화면이 직접 부른다.
    expect(postScreen).toMatch(/Share\.share\(/);
    expect(postScreen).toMatch(/buildShareUrl\(/);
    expect(postScreen).toMatch(/\/community\/\$\{postId\}/);
  });
});

describe('레포 함정 — 같은 버그를 다시 만들지 않기', () => {
  const sources: string[] = [];
  const collect = (dir: string) => {
    for (const entry of fs.readdirSync(path.join(MOBILE, dir), {
      withFileTypes: true,
    })) {
      if (entry.isDirectory()) collect(path.join(dir, entry.name));
      else if (/\.tsx?$/.test(entry.name))
        sources.push(path.join(dir, entry.name));
    }
  };
  collect('src/screens/community');
  collect('src/features/community');
  collect('src/entities/community');

  /**
   * ★web HighlightText 는 `new RegExp(keyword)` 라 키워드가 `C++` 이면
   * SyntaxError 로 화면이 흰색이 됐다. 커뮤니티에는 사용자 입력을 정규식으로
   * 만드는 자리를 두지 않는다(알림 탭과 같은 판단).
   */
  it('사용자 입력으로 정규식을 만들지 않는다', () => {
    const offenders = sources.filter(f => readCode(f).includes('new RegExp'));
    expect(offenders).toEqual([]);
  });

  /**
   * ★`PressableScale` 의 className 은 **안쪽 View** 가 받는다. 크기 클래스를
   * 주면 바깥 Pressable 폭이 0 이 되어 통째로 안 보인다(이 레포 3회 재발).
   */
  it('PressableScale 에 크기 클래스를 주지 않는다', () => {
    const offenders = sources.filter(f => {
      const src = readCode(f);
      return [...src.matchAll(/<PressableScale[\s\S]{0,300}?>/g)].some(m =>
        /className="[^"]*\b(flex-1|w-full|h-full|absolute)\b/.test(m[0]),
      );
    });
    expect(offenders).toEqual([]);
  });

  /** ★NativeWind 는 Animated.* 의 className 을 조용히 무시한다. */
  it('Animated.* 에 className 을 주지 않는다', () => {
    const offenders = sources.filter(f => {
      const src = readCode(f);
      return [...src.matchAll(/<Animated\.\w+[\s\S]{0,400}?>/g)].some(m =>
        m[0].includes('className='),
      );
    });
    expect(offenders).toEqual([]);
  });

  /** 회색 본문은 gray-500 이다 — gray-400 은 흰 배경에서 2.58:1(AA 미달). */
  it('gray-400 텍스트를 쓰지 않는다', () => {
    const offenders = sources.filter(f => /text-gray-400/.test(readCode(f)));
    expect(offenders).toEqual([]);
  });

  /**
   * 첨부 이미지는 원본 크기가 저장되지 않는다(마커에 URL 만).
   * 고정 비율 박스에 cover 로 넣으면 반드시 잘리므로 한 장은 실측한다.
   */
  it('한 장짜리 첨부는 비율을 실측해서 그린다(잘림 방지)', () => {
    const postImages = read('src/features/community/ui/PostImages.tsx');
    expect(postImages).toMatch(/Image\.getSize\(/);
    expect(postImages).toMatch(/resizeMode="contain"/);
  });

  /** 앱에서 도달 불가한 web 분기를 옮기면 영원히 안 뜨는 코드가 된다. */
  it('비로그인·앱다운로드 안내 분기를 옮기지 않았다', () => {
    const offenders = sources.filter(f =>
      /AppDownloadGuide|LoginGuide|isJirumAlarmApp/.test(readCode(f)),
    );
    expect(offenders).toEqual([]);
  });

  /** 새 네이티브 의존성·바텀시트 라이브러리를 넣지 않았다. */
  it('새 패키지를 쓰지 않는다(이미지 피커·바텀시트·vaul)', () => {
    const offenders = sources.filter(f =>
      /image-picker|gorhom\/bottom-sheet|vaul/.test(readCode(f)),
    );
    expect(offenders).toEqual([]);
    const pkg = JSON.parse(read('package.json'));
    expect(Object.keys(pkg.dependencies)).not.toContain('expo-image-picker');
  });
});
