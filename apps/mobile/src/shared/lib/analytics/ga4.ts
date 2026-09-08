import analytics from '@react-native-firebase/analytics';

// 앱(RN) 사용자 행동 분석 — GA4 앱 스트림(Firebase Analytics).
// 웹은 GTM → GA4 웹 스트림으로 보내고, 앱은 여기서 같은 GA4 속성(394356262)의
// iOS/Android 스트림으로 보낸다. Firebase 프로젝트(122536148676)는 FCM 용으로
// 이미 붙어 있어 별도 설정·토큰이 없다. 이벤트명은 웹 dataLayer 와 같게 유지한다.
//
// GA4 제약: 이벤트명 40자·영숫자/밑줄, 파라미터 25개, 값은 문자열 100자 또는 숫자.
// boolean·null 은 거부되므로 문자열로 바꾸거나 버린다.

const toParams = (
  props?: Record<string, unknown>,
): Record<string, string | number> | undefined => {
  if (!props) return undefined;
  const out: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;
    out[key] = typeof value === 'number' ? value : String(value).slice(0, 100);
  }
  return out;
};

/**
 * 분석 실패가 앱 흐름을 막지 않는다 — 전부 fire-and-forget + 로그.
 *
 * 🔴`.catch()` 만으로는 그 약속이 지켜지지 않는다. `analytics()` 자체가 **동기로
 * 던진다** — 네이티브 모듈이 없는 앱에서는 프라미스가 만들어지기도 전에 예외가
 * 나서 호출부까지 올라간다:
 *
 *   Uncaught Error: You attempted to use a Firebase module that's not installed
 *   natively ... have rebuilt your native application.
 *     at Analytics.track → open (useDeepLink) → Linking.addEventListener
 *
 * iOS 26 시뮬레이터 실측: 딥링크를 열면 **앱이 레드스크린으로 죽었다.** 네이티브
 * 모듈이 추가된 커밋 이전에 만들어진 빌드가 그렇고, ⚠️**JS 만 나가는 OTA
 * 업데이트**를 받은 설치 앱도 같다(스토어 빌드가 나가기 전까지).
 * 그래서 호출 자체를 try/catch 로 감싼다.
 */
// 네이티브 모듈 부재는 **실행 내내 유지되는 조건**이라 호출마다 찍으면 로그가
// 흐른다(dev 에선 LogBox 토스트가 화면 하단을 계속 덮어 시뮬레이터 검증까지
// 막았다). 라벨당 한 번만 남긴다 — 두 번째 로그가 알려주는 새 사실이 없다.
const logged = new Set<string>();
const logOnce = (key: string, message: string, error: unknown) => {
  if (logged.has(key)) return;
  logged.add(key);
  console.error(message, error);
};

const safely = (label: string, run: () => Promise<unknown>) => {
  try {
    run().catch(e => logOnce(`fail:${label}`, `[GA4] ${label} 실패:`, e));
  } catch (e) {
    // 네이티브 모듈 부재 등 동기 예외. 로그만 남기고 흐름은 그대로 진행한다.
    logOnce(`sync:${label}`, `[GA4] ${label} 불가:`, e);
  }
};

export const Analytics = {
  // 로그인 유저 식별 — 웹의 user_id 와 같은 키로 크로스 플랫폼 유저 병합.
  identify(userId: string) {
    if (!userId) return;
    safely('identify', () => analytics().setUserId(userId));
  },

  track(event: string, props?: Record<string, unknown>) {
    safely(`track(${event})`, () =>
      analytics().logEvent(event, toParams(props)),
    );
  },

  // 로그아웃 시 user_id 해제(다음 유저와 섞이지 않도록).
  reset() {
    safely('reset', () => analytics().setUserId(null));
  },
};
