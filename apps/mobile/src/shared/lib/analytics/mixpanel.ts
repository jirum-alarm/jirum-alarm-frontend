import {Mixpanel} from 'mixpanel-react-native';

// 앱(RN) 사용자 행동 분석. web 은 GTM 이 Mixpanel 로 위임 전송하지만,
// 네이티브 화면(소셜 로그인/가입 등)은 GTM DOM 트리거가 닿지 않아 영구 미측정이었다.
// 여기서 web 과 같은 Mixpanel project 로 직접 전송한다. distinct_id=userId 로
// 웹/앱 프로필을 병합한다(web 의 identify 와 동일 키).
//
// 토큰은 EXPO_PUBLIC_MIXPANEL_TOKEN env 로 주입한다. 미설정이면 모든 호출이
// no-op 이라 빌드/실행은 그대로 동작하고 측정만 비활성화된다(시크릿 성격이라 코드에 박지 않음).

const MIXPANEL_TOKEN = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN ?? '';

let instance: Mixpanel | null = null;
let initPromise: Promise<void> | null = null;

const isEnabled = () => MIXPANEL_TOKEN.length > 0;

export const MixpanelService = {
  // 앱 진입 시 1회 호출. 토큰 없으면 경고만 남기고 no-op.
  async init() {
    if (!isEnabled()) {
      if (__DEV__) {
        console.warn(
          '[Mixpanel] EXPO_PUBLIC_MIXPANEL_TOKEN 미설정 — 분석 전송 비활성화(no-op).',
        );
      }
      return;
    }
    if (initPromise) return initPromise;

    initPromise = (async () => {
      try {
        // trackAutomaticEvents=false: web 과 이벤트 셋을 일치시키기 위해 수동 track 만 사용.
        const mp = new Mixpanel(MIXPANEL_TOKEN, false);
        await mp.init();
        instance = mp;
      } catch (e) {
        // 분석 초기화 실패가 앱 흐름을 막지 않는다.
        console.error('[Mixpanel] init 실패:', e);
        instance = null;
      }
    })();

    return initPromise;
  },

  // 로그인 유저 식별 — 익명↔회원 프로필 병합. web 의 identify(user_id) 와 같은 키.
  identify(userId: string) {
    if (!instance || !userId) return;
    try {
      instance.identify(userId);
    } catch (e) {
      console.error('[Mixpanel] identify 실패:', e);
    }
  },

  track(event: string, props?: Record<string, unknown>) {
    if (!instance) return;
    try {
      instance.track(event, props);
    } catch (e) {
      console.error(`[Mixpanel] track(${event}) 실패:`, e);
    }
  },

  // 로그아웃 시 익명 distinct_id 로 리셋(다음 유저와 섞이지 않도록).
  reset() {
    if (!instance) return;
    try {
      instance.reset();
    } catch (e) {
      console.error('[Mixpanel] reset 실패:', e);
    }
  },
};
