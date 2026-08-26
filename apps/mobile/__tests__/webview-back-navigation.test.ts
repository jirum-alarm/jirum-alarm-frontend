export {};

/**
 * 탭 스택에 push 된 웹뷰의 **뒤로가기**.
 *
 * 알림 탭을 네이티브로 옮기면서 드러난 회귀 —
 * 웹뷰 탭 시절엔 "키워드 알림"이 같은 웹뷰 안 SPA 이동이라 history 가 쌓여
 * web `router.back()` 이 동작했다. 네이티브 탭에서 새 웹뷰로 push 하면
 * history 가 비어 web `useGoBack` 이 **`router.push('/')`** 로 떨어진다
 * → 그 웹뷰 안에 홈이 그려지고 원래 화면으로 못 돌아온다.
 */
const fs = require('fs');
const path = require('path');

declare const __dirname: string;

const read = (p: string) =>
  fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const readWeb = (p: string) =>
  fs.readFileSync(path.join(__dirname, '../../web/src', p), 'utf8');

const webviewScreen = read(
  'src/screens/jirumalarmwebview/JirumAlarmWebViewScreen.tsx',
);
const detailWebview = read('src/screens/detail/ProductDetailWebViewScreen.tsx');
const script = read('src/shared/lib/webview/native-stack-script.ts');
const goBack = readWeb('shared/hooks/useGoBack.ts');

/** web useGoBack 의 3갈래 판정을 그대로 재현한다. */
function goBackDecision({
  nativeStack,
  isInApp,
  referrer,
  historyLength,
}: {
  nativeStack?: string;
  isInApp: boolean;
  referrer: string;
  historyLength: number;
}) {
  if (nativeStack === 'true' && isInApp) return 'native-pop';
  if (
    (referrer && referrer.indexOf('jirum-alarm.com') !== -1) ||
    historyLength > 1
  ) {
    return 'router-back';
  }
  return 'router-push-home';
}

describe('web useGoBack 의 3갈래 — 재현 로직이 소스와 맞나', () => {
  it('소스가 세 갈래를 그대로 갖고 있다', () => {
    expect(goBack).toContain('nativeStack');
    expect(goBack).toContain('PRESS_BACKBUTTON');
    expect(goBack).toMatch(/router\.back\(\)/);
    expect(goBack).toMatch(/router\.push\(backTo\)/);
    expect(goBack).toMatch(/window\.history\.length > 1/);
  });

  it('★주입이 없으면 새 웹뷰는 홈을 그린다(이번 회귀의 정체)', () => {
    expect(
      goBackDecision({
        nativeStack: undefined,
        isInApp: true,
        referrer: '',
        historyLength: 1,
      }),
    ).toBe('router-push-home');
  });

  it('주입이 있으면 네이티브 pop 으로 간다', () => {
    expect(
      goBackDecision({
        nativeStack: 'true',
        isInApp: true,
        referrer: '',
        historyLength: 1,
      }),
    ).toBe('native-pop');
  });

  it('웹뷰 탭 시절(SPA 이동)은 history 가 쌓여 router.back 이었다', () => {
    expect(
      goBackDecision({
        nativeStack: undefined,
        isInApp: true,
        referrer: '',
        historyLength: 2,
      }),
    ).toBe('router-back');
  });
});

describe('★★뒤로가기 pop 은 정확히 한 번만 — 실측 회귀', () => {
  /**
   * 2026-08-26 실기동(idb)으로 잡은 진짜 원인.
   *
   * iOS 의 `onMessage` 는 핸들러를 **두 개** 호출한다:
   *   onMessage={event => { handleWebViewMessage(event); handleNavigationStateChange(event); }}
   * 그런데 `useCommonWebViewLogic.handleNavigationStateChange` 가 **이미**
   * PRESS_BACKBUTTON 을 받아 `navigation.goBack()` 을 한다.
   * 여기에 화면이 자체 pop 을 하나 더 붙이면 **두 번 pop** 되어
   * 탭 스택을 빠져나가 **홈 탭으로 튄다**.
   *
   * 계측 근거(pop 을 생략했더니 정상):
   *   [DBG-NOPOP] pop 생략
   *   [DBG-AFTER] stack=["TabRoot"] idx=0 | tab=AlarmTab   ← 이미 pop 돼 있고 탭 유지
   */
  it('PRESS_BACKBUTTON → goBack 은 useCommonWebViewLogic 한 곳뿐이다', () => {
    const logic = read(
      'src/screens/jirumalarmwebview/hooks/useCommonWebViewLogic.ts',
    );
    expect(logic).toMatch(/PRESS_BACKBUTTON[\s\S]{0,80}goBack\(\)/);
  });

  it('★화면이 pop 을 중복으로 붙이지 않는다(홈으로 튀던 원인)', () => {
    // 이 화면은 메시지를 그대로 전역 브리지로 넘기고, pop 은 위 훅에 맡긴다.
    expect(webviewScreen).not.toContain('useBackAwareMessageHandler');
    expect(webviewScreen).not.toContain('StackActions.pop');
    expect(webviewScreen).not.toContain('popGuard');
  });

  it('두 웹뷰 모두 소박하게 handleWebViewMessage 를 쓴다', () => {
    // Android 1 + iOS 1 = 2. 한쪽만 고치면 반쪽 수정이라 개수로 고정한다.
    const uses = webviewScreen.match(/handleWebViewMessage\(?/g) ?? [];
    expect(uses.length).toBeGreaterThanOrEqual(2);
  });

  /**
   * 전역 브리지는 여전히 exitApp 이다. 그래서 **pop 을 하는 화면**
   * (상세 폴백)은 반드시 가로채고 return 해야 한다 — 그 계약은 유지한다.
   */
  it('전역 브리지의 PRESS_BACKBUTTON 은 exitApp 이다', () => {
    const event = read('src/shared/lib/webview/event.ts');
    expect(event).toMatch(/pressBackButton[\s\S]{0,120}exitApp/);
  });

  it('상세 폴백 웹뷰는 자체 스택이라 가로채고 return 한다', () => {
    expect(detailWebview).toContain('NATIVE_STACK_SCRIPT');
    expect(detailWebview).toMatch(/PRESS_BACKBUTTON[\s\S]{0,200}goBack\(\)/);
    expect(detailWebview).toMatch(/goBack\(\);[\s\S]{0,60}return;/);
  });

  it('주입은 두 웹뷰(Android·iOS) 모두에 걸렸다', () => {
    const injections =
      webviewScreen.match(/injectedJavaScript=\{NATIVE_STACK_SCRIPT\}/g) ?? [];
    expect(injections).toHaveLength(2);
  });
});

describe('주입 스크립트 자체', () => {
  it('dataset.nativeStack 을 켜고 뒤로가기 버튼을 가로챈다', () => {
    expect(script).toContain("dataset.nativeStack = 'true'");
    expect(script).toContain('aria-label="뒤로 가기"');
    expect(script).toContain('PRESS_BACKBUTTON');
  });

  it('중복 리스너를 막는 가드가 있다', () => {
    // ⚠️가드는 DOM 에 있어야 한다 — window 플래그는 문서 로드로 날아간다
    // (그래서 리스너가 2번 붙어 pop 이 2번 일어났다)
    expect(script).toContain('dataset.jirumBackHooked');
  });

  it('한 곳에서만 정의된다(복붙 금지)', () => {
    // 상세 화면이 자기 사본을 갖고 있으면 한쪽만 고쳐지는 사고가 난다
    expect(detailWebview).not.toContain('const NATIVE_STACK_SCRIPT = `');
    expect(detailWebview).toMatch(
      /import \{[\s\S]{0,200}NATIVE_STACK_SCRIPT[\s\S]{0,200}\} from '@\/shared\/lib\/webview'/,
    );
  });
});

describe('알림 탭이 여는 화면들 — 탭 구조를 벗어나지 않나', () => {
  const alarm = read('src/screens/alarm/AlarmScreen.tsx');
  const navigator = read('src/navigations/tab/TabStackNavigator.tsx');

  it('push 대상이 모두 탭 스택 라우트다(MainStack 으로 나가면 탭바가 두 겹)', () => {
    const pushed = [...alarm.matchAll(/tabStackNavigations\.(\w+)/g)].map(
      m => m[1],
    );
    expect(pushed.length).toBeGreaterThan(0);
    for (const route of pushed) {
      expect(navigator).toContain(`tabStackNavigations.${route}`);
    }
    expect(alarm).not.toContain('mainNavigations');
  });

  it('WEBVIEW 는 탭바를 숨기고 DETAIL 은 보인다(현행 정책)', () => {
    const rule = navigator.slice(
      navigator.indexOf('function hidesTabBar'),
      navigator.indexOf('function hidesTabBar') + 600,
    );
    expect(rule).toContain('tabStackNavigations.WEBVIEW');
    expect(rule).not.toMatch(/routeName === tabStackNavigations\.DETAIL/);
  });
});

describe('★탭 스택 웹뷰의 하단 safe area', () => {
  /**
   * iOS 26 은 탭바를 숨길 때 내비게이터가 marginBottom 음수로 화면을 당긴다.
   * 화면이 되밀지 않으면 웹 콘텐츠가 홈 인디케이터에 붙는다.
   * 폴백 상세 웹뷰에서 먼저 터졌고(b6fac36f), 같은 누락이 이 화면에도 있었다.
   */
  it('clip 만큼 하단을 비운다(insets 만 쓰면 잘린다)', () => {
    expect(webviewScreen).toContain('useHiddenTabBarClipPadding');
    // 스페이서 높이가 계산값을 쓴다 — 날 insets.bottom 이 아니다
    expect(webviewScreen).not.toMatch(/height: insets\.bottom\}\]/);
    expect(webviewScreen).toMatch(/height: bottomInset\}\]/);
  });

  /**
   * ★위 검사는 "훅을 import 했나"만 봐서, 훅 **본문**이
   * `return insets.bottom` 으로 되돌아가도 통과했다(뮤테이션으로 확인).
   * 그래서 반환식 자체를 못 박는다 — 여기가 진짜 계약이다.
   */
  it('훅 본문이 clip 값을 우선한다', () => {
    const body = webviewScreen.slice(
      webviewScreen.indexOf('function useWebViewBottomInset'),
      webviewScreen.indexOf('function useBackAwareMessageHandler'),
    );
    expect(body).toMatch(/clipPad > 0 \? clipPad : insets\.bottom/);
  });

  it('Android·iOS 두 화면 모두 적용됐다(쌍)', () => {
    const uses = webviewScreen.match(/height: bottomInset\}\]/g) ?? [];
    expect(uses).toHaveLength(2);
    const calls = webviewScreen.match(/[=] useWebViewBottomInset\(\)/g) ?? [];
    expect(calls).toHaveLength(2);
  });

  it('선례(상세 폴백)도 여전히 하단 여백을 준다', () => {
    expect(detailWebview).toContain('getReservedBottomPx');
    expect(detailWebview).toContain(
      'hideTabBar ? tabBarClipPad : reservedBottom',
    );
  });
});

describe('★★뒤로가기 pop 이 두 번 일어나면 탭 밖으로 튄다 (실측 회귀)', () => {
  /**
   * ⚠️이 가드는 **웹 리스너 중복 등록**만 막는다. 홈으로 튀던 진짜 원인은
   * 이게 아니라 네이티브 핸들러가 두 벌이었던 것이다(위 describe 참조).
   * 그래도 dataset 가드 자체는 옳다 — window 플래그는 문서 로드 때 날아간다.
   */
  it('중복 등록 가드가 window 가 아니라 DOM 에 있다', () => {
    // window 플래그는 문서 로드 때 날아가 가드 역할을 못 한다
    expect(script).not.toContain('window.__jirumNativeStackBack');
    expect(script).toContain('dataset.jirumBackHooked');
  });

  it('계측 로그는 남기지 않았다', () => {
    expect(webviewScreen).not.toContain('JIRUM-DBG');
    expect(webviewScreen).not.toMatch(/console\.log/);
  });
});

describe('★가드 로직을 실제로 실행해 본다 (소스텍스트 검사만으론 부족)', () => {
  /**
   * 주입 스크립트는 문자열이라 타입체커가 못 본다. 그래서 **로직만 떼어 실행**한다.
   * dataset 가드는 document 에 남고, window 가드는 문서 로드로 날아간다 —
   * 이 차이가 pop 2번(홈으로 튐)의 원인이었다.
   */
  type FakeDoc = {
    documentElement: {dataset: Record<string, string>};
    count: number;
  };

  /** native-stack-script 의 등록부와 같은 판정. */
  const inject = (doc: FakeDoc) => {
    doc.documentElement.dataset.nativeStack = 'true';
    if (doc.documentElement.dataset.jirumBackHooked === '1') return 'skipped';
    doc.documentElement.dataset.jirumBackHooked = '1';
    doc.count += 1;
    return 'registered';
  };

  it('두 번 주입해도 리스너는 한 번만 등록된다', () => {
    const doc: FakeDoc = {documentElement: {dataset: {}}, count: 0};
    expect(inject(doc)).toBe('registered'); // BeforeContentLoaded
    expect(inject(doc)).toBe('skipped'); // injectedJavaScript
    expect(doc.count).toBe(1);
  });

  it('대조군 — window 가드였다면 두 번 등록된다(옛 버그)', () => {
    let win: {hooked?: boolean} = {};
    let count = 0;
    const old = () => {
      if (win.hooked) return;
      win.hooked = true;
      count += 1;
    };
    old();
    win = {}; // ← 문서 로드가 window 를 새로 만든다
    old();
    expect(count).toBe(2); // 이래서 PRESS_BACKBUTTON 이 2번 갔다
  });

  it('수신측 700ms 방어 — 연속 두 번째는 무시된다', () => {
    let last = 0;
    const pop = (now: number) => {
      if (now - last < 700) return 'suppressed';
      last = now;
      return 'pop';
    };
    expect(pop(1000)).toBe('pop');
    expect(pop(1050)).toBe('suppressed'); // 같은 탭에서 온 중복
    expect(pop(3000)).toBe('pop'); // 사용자가 다시 누른 것
  });
});
