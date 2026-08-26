export {};

/**
 * 알림 탭 네이티브 전환.
 *
 * 웹뷰였던 `/alarm` 을 네이티브로 옮겼다. 여기서 지키는 건 두 축이다 —
 * (1) 표시 규칙이 web 과 같은가, (2) **웹뷰가 대신 해주던 일**을
 * 네이티브가 이어받았는가(앱 아이콘 배지).
 */
const fs = require('fs');
const path = require('path');

declare const __dirname: string;

const read = (p: string) =>
  fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const readWeb = (p: string) =>
  fs.readFileSync(path.join(__dirname, '../../web/src', p), 'utf8');

const {
  splitByKeyword,
  firstKeyword,
} = require('../src/screens/alarm/lib/highlight');

const screen = read('src/screens/alarm/AlarmScreen.tsx');
const viewModel = read('src/screens/alarm/model/useNotificationsViewModel.ts');
const item = read('src/screens/alarm/ui/AlarmItem.tsx');
const flags = read('src/constants/feature-flags.ts');
const navigator = read('src/navigations/tab/TabStackNavigator.tsx');

describe('키워드 강조 — web HighlightText 와 같은 분할', () => {
  it('일치 구간만 강조로 표시한다', () => {
    expect(splitByKeyword('닌텐도 스위치 특가', '닌텐도')).toEqual([
      {text: '닌텐도', match: true},
      {text: ' 스위치 특가', match: false},
    ]);
  });

  it('여러 번 나오면 전부 강조한다(web split(regex) 와 같음)', () => {
    expect(splitByKeyword('램 8기가 램 16기가', '램')).toEqual([
      {text: '램', match: true},
      {text: ' 8기가 ', match: false},
      {text: '램', match: true},
      {text: ' 16기가', match: false},
    ]);
  });

  it('키워드가 없으면 원문 한 덩어리', () => {
    expect(splitByKeyword('아무 메시지', '')).toEqual([
      {text: '아무 메시지', match: false},
    ]);
  });

  it('일치가 없으면 원문 한 덩어리', () => {
    expect(splitByKeyword('아무 메시지', '없는키워드')).toEqual([
      {text: '아무 메시지', match: false},
    ]);
  });

  /**
   * ★web 이 흰화면으로 죽던 입력. `new RegExp('(C++)')` 는 SyntaxError 라
   * web 은 escapeRegExp 를 붙여서 막았다. indexOf 방식은 애초에 안 죽는다.
   */
  it('정규식 메타문자가 든 키워드에도 죽지 않는다', () => {
    expect(() => splitByKeyword('C++ 책 할인', 'C++')).not.toThrow();
    expect(splitByKeyword('C++ 책 할인', 'C++')).toEqual([
      {text: 'C++', match: true},
      {text: ' 책 할인', match: false},
    ]);
    // 실제로 등록되는 키워드 예시들
    expect(() => splitByKeyword('1++ 한우', '1++')).not.toThrow();
    expect(() => splitByKeyword('(주)삼성', '(주)')).not.toThrow();
    expect(() => splitByKeyword('a.b 제품', 'a.b')).not.toThrow();
    // `.` 이 임의문자로 동작하면 'axb' 도 잡힌다 — 리터럴 비교임을 확인
    expect(splitByKeyword('axb 제품', 'a.b')).toEqual([
      {text: 'axb 제품', match: false},
    ]);
  });

  it('강조는 키워드의 첫 단어만 (web keyword.split(" ")[0])', () => {
    expect(firstKeyword('닌텐도 스위치')).toBe('닌텐도');
    expect(firstKeyword(null)).toBe('');
    expect(firstKeyword(undefined)).toBe('');
  });
});

describe('★배지 인수인계 — 웹뷰가 하던 일을 네이티브가 이어받았나', () => {
  /**
   * 웹뷰 시절: web 이 뮤테이션 뒤 NOTIFICATION_READ 를 올리고,
   * 네이티브 event.ts 가 setBadgeCountAsync + setUnreadCount 를 했다.
   * 네이티브 화면이 되면 그 브릿지가 안 오므로 화면이 직접 해야 한다.
   * 이게 빠지면 **읽어도 앱 아이콘 배지가 영구히 안 내려간다**(조용한 실패).
   */
  it('뮤테이션 뒤 앱 아이콘 배지를 직접 갱신한다', () => {
    expect(viewModel).toMatch(/setBadgeCountAsync/);
  });

  it('전역 미읽음 스토어도 같이 갱신한다', () => {
    expect(viewModel).toMatch(/setUnreadCount\(/);
  });

  it('배지 값은 서버에서 다시 받은 수를 쓴다(낙관적 추측 금지)', () => {
    expect(viewModel).toMatch(/getUnreadCount\(\)/);
  });

  /**
   * fcm-handler 와 같은 가드. Android 는 런처마다 배지 지원이 갈려
   * expo-notifications 가 던질 수 있고, 그 예외가 onSettled 에서 터지면
   * 읽음/삭제가 unhandled rejection 으로 시끄러워진다.
   */
  it('배지는 iOS 만 쓰고, 실패해도 읽음/삭제를 깨지 않는다', () => {
    expect(viewModel).toMatch(/Platform\.OS === 'ios'/);
    expect(viewModel).toMatch(/setBadgeCountAsync\([\s\S]{0,40}\)\.catch/);
  });

  it('읽음·삭제 4개 흐름 모두 배지 동기화를 지난다', () => {
    // syncUnreadCount 를 onSettled 로 매단 횟수 = 뮤테이션 4개
    const hooked = viewModel.match(/onSettled: \(\) => syncUnreadCount/g) ?? [];
    expect(hooked).toHaveLength(4);
  });
});

describe('web 과 같은 쓰기 4종을 모두 갖췄나', () => {
  const webViewModel = readWeb(
    'features/alarm/model/useNotificationsViewModel.ts',
  );

  it.each([
    ['readNotification', '개별 읽음'],
    ['readAllNotifications', '전체 읽음'],
    ['removeNotification', '개별 삭제'],
    ['removeAllNotifications', '전체 삭제'],
  ])('%s (%s)', (method: string) => {
    // web 에 있는 흐름이 네이티브에도 있어야 한다
    expect(webViewModel).toContain(method);
    expect(viewModel).toContain(method);
  });

  it('낙관적 업데이트와 롤백이 있다(web onMutate/onError 대응)', () => {
    expect(viewModel).toMatch(/onMutate/);
    expect(viewModel).toMatch(/onError/);
    expect(viewModel).toMatch(/rollback/);
  });
});

describe('표시 규칙이 web 과 같은가', () => {
  const webItem = readWeb('features/alarm/ui/AlarmItem.tsx');
  const webList = readWeb('features/alarm/ui/AlarmList.tsx');
  const webEmpty = readWeb('features/alarm/ui/NoAlerts.tsx');
  const empty = read('src/screens/alarm/ui/NoAlerts.tsx');

  it('판매종료·핫딜 뱃지 문구가 같다', () => {
    for (const label of ['판매종료', '핫딜']) {
      expect(webItem).toContain(label);
      expect(item).toContain(label);
    }
  });

  it('읽은 알림은 흐리게, 새 알림은 배경 강조', () => {
    expect(item).toMatch(/opacity-60/);
    expect(item).toMatch(/bg-primary-50/);
  });

  it('안내 줄 문구가 web AlarmList 와 같다', () => {
    for (const copy of [
      '지금 다양한 핫딜 알림을 받아보세요!',
      '키워드 알림',
      '전체 삭제',
      '완료',
    ]) {
      expect(webList).toContain(copy);
      expect(screen).toContain(copy);
    }
  });

  it('빈 상태 문구가 web NoAlerts 와 같다', () => {
    for (const copy of [
      '아직 도착한 알림이 없어요',
      '키워드를 등록하고 알림을 받아보세요.',
      '키워드 등록',
    ]) {
      expect(webEmpty).toContain(copy);
      expect(empty).toContain(copy);
    }
  });
});

describe('접합부 — 상품 없는 알림·화면 이동', () => {
  it('상품이 없으면 상세로 보내지 않는다(web hasProduct 분기)', () => {
    // productId == null 이면 early return
    expect(screen).toMatch(/productId == null\) return/);
  });

  it('안 읽은 알림만 읽음 처리한다(web !readAt 분기)', () => {
    expect(screen).toMatch(/!notification\.readAt/);
  });

  it('키워드 관리는 아직 web 이라 웹뷰로 push 한다', () => {
    expect(screen).toContain('/mypage/keyword');
    expect(screen).toMatch(/tabStackNavigations\.WEBVIEW/);
  });

  it('상세는 네이티브 스택으로 push 한다', () => {
    expect(screen).toMatch(/tabStackNavigations\.DETAIL/);
  });
});

describe('플래그 배선 — 되돌릴 수 있나', () => {
  it('NATIVE_ALARM 플래그가 있다', () => {
    expect(flags).toMatch(/export const NATIVE_ALARM/);
  });

  it('네비게이터가 플래그로 분기해 웹뷰 폴백을 남긴다', () => {
    expect(navigator).toMatch(
      /NATIVE_ALARM && tabName === tabNavigations\.ALARM/,
    );
    // 플래그가 false 면 기존 TabWebView 로 떨어진다
    expect(navigator).toMatch(/<TabWebView/);
  });
});

describe('★옮기지 않은 것 — web 전용 분기', () => {
  const webContainer = readWeb('features/alarm/ui/AlarmContainer.tsx');

  /**
   * web AlarmContainer 는 비로그인·비앱 분기를 갖지만 앱에서는 도달할 수 없다.
   * RootNavigator 가 비로그인을 AuthNavigator 로 보내고, isJirumAlarmApp 은
   * 앱에서 항상 참이다. 옮기면 영원히 안 뜨는 코드가 된다 — 일부러 뺐다는 기록.
   */
  it('web 에는 앱다운로드·로그인 유도 분기가 있다', () => {
    expect(webContainer).toContain('AppDownloadGuide');
    expect(webContainer).toContain('LoginGuide');
  });

  it('네이티브 화면은 그 둘을 옮기지 않았다', () => {
    // ⚠️단순 substring 은 못 쓴다 — 화면 주석이 "왜 안 옮겼는지" 설명하며
    // 두 이름을 언급한다. 주석을 걷어낸 코드에서만 찾는다.
    const code = screen
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    expect(code).not.toContain('AppDownloadGuide');
    expect(code).not.toContain('LoginGuide');
    // 렌더 분기가 없다는 것까지 (컴포넌트 사용 흔적 0)
    expect(code).not.toMatch(/<(AppDownloadGuide|LoginGuide)/);
  });

  it('비로그인은 RootNavigator 가 앞단에서 막는다', () => {
    const root = read('src/navigations/root/RootNavigator.tsx');
    expect(root).toMatch(/isLogin \? <MainNavigator \/> : <AuthNavigator \/>/);
  });
});

describe('터치 인터랙션 — web whileTap 대응', () => {
  const alarmItem = read('src/screens/alarm/ui/AlarmItem.tsx');

  it('버튼은 PressableScale(=web whileTap scale 0.95)', () => {
    // 헤더 휴지통·전체삭제·완료·키워드알림 4개
    const scaled = screen.match(/<PressableScale/g) ?? [];
    expect(scaled.length).toBe(4);
    // 맨 Pressable 이 남아 있으면 피드백 없는 버튼이다
    expect(screen).not.toMatch(/<Pressable[\s\n]/);
  });

  it('★행은 scale 이 아니라 눌림 하이라이트(폭이 화면 전체라 축소가 어색)', () => {
    expect(alarmItem).toMatch(/pressed \? \{opacity: 0\.6\} : null/);
    expect(alarmItem).toContain('android_ripple');
  });

  /**
   * ⚠️한때 이 버튼을 `PressableScale` 로 두고 "아이콘은 scale" 이라고 고정했었다.
   * 그런데 그 컴포넌트는 className 을 **안쪽 View** 로 넘겨서 `absolute` 가
   * 안 걸린다 — X 가 행 사이에 뜨는 실측 버그가 났다(아래 describe 참조).
   * 절대배치가 우선이라 평범한 Pressable + hitSlop 으로 되돌렸다.
   */
  it('삭제(X) 버튼은 절대배치가 우선이라 scale 을 쓰지 않는다', () => {
    expect(alarmItem).toMatch(/<Pressable[\s\S]{0,300}알림 삭제/);
    expect(alarmItem).toMatch(/hitSlop/);
  });
});

describe('★편집모드 삭제(X) 버튼 — absolute 가 실제로 걸리는가', () => {
  /**
   * 실측 버그(2026-08-26): X 가 행 오른쪽 가운데가 아니라 **행 사이**에 떴다.
   * `onLayout` 으로 재보니 `h=0 w=402` — **absolute 가 아예 안 걸려** 일반
   * 블록으로 행 아래에 쌓이고 있었다.
   *
   * 원인은 CSS 가 아니라 **컴포넌트 선택**이었다. `PressableScale` 은
   * className 을 **안쪽 View** 로 넘기는 구조라(그 파일 주석에 명시돼 있다)
   * 껍데기에 `absolute` 를 줄 수 없다.
   *
   * ⚠️이 버그는 tsc·lint·소스텍스트 검사를 **전부 통과**했다. 클래스 이름은
   * 멀쩡히 있었고 적용만 안 됐다. 그래서 "무엇을 쓰지 말아야 하는가"로 고정한다.
   */
  it('삭제 버튼에 PressableScale 을 쓰지 않는다', () => {
    // ⚠️주석이 "왜 안 쓰는지" 설명하며 이름을 언급한다 — 코드에서만 찾는다.
    const code = item.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    expect(code).not.toContain('PressableScale');
  });

  it('절대배치를 className 이 아니라 style 로 준다', () => {
    // NativeWind 클래스는 래퍼에 먹힐 수 있다 — StyleSheet 는 그 화면이 없다.
    expect(item).toMatch(/position:\s*'absolute'/);
    expect(item).toMatch(/top:\s*0/);
    expect(item).toMatch(/bottom:\s*0/);
    expect(item).toMatch(/justifyContent:\s*'center'/);
  });

  it('web 과 같은 오른쪽 여백(right-5 = 20)', () => {
    expect(item).toMatch(/right:\s*20/);
  });

  it('편집모드일 때만 렌더한다', () => {
    expect(item).toMatch(/isEditMode \?[\s\S]{0,400}알림 삭제/);
  });
});
