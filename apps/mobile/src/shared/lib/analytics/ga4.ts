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

// 분석 실패가 앱 흐름을 막지 않는다 — 전부 fire-and-forget + 로그.
export const Analytics = {
  // 로그인 유저 식별 — 웹의 user_id 와 같은 키로 크로스 플랫폼 유저 병합.
  identify(userId: string) {
    if (!userId) return;
    analytics()
      .setUserId(userId)
      .catch(e => console.error('[GA4] identify 실패:', e));
  },

  track(event: string, props?: Record<string, unknown>) {
    analytics()
      .logEvent(event, toParams(props))
      .catch(e => console.error(`[GA4] track(${event}) 실패:`, e));
  },

  // 로그아웃 시 user_id 해제(다음 유저와 섞이지 않도록).
  reset() {
    analytics()
      .setUserId(null)
      .catch(e => console.error('[GA4] reset 실패:', e));
  },
};
