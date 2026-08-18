import * as Sentry from '@sentry/react-native';
import * as Updates from 'expo-updates';

// 앱(RN) 크래시·에러 수집. web 은 @sentry/nextjs 로 이미 보내고 있었지만
// 앱은 유저 폰에서 죽어도 아무 기록이 남지 않았다(유일한 신호가 스토어 리뷰).
// org 는 web 과 같은 jirumalarm, project 만 앱용으로 분리한다.
//
// DSN 은 EXPO_PUBLIC_SENTRY_DSN env 로 주입한다. 미설정이면 init 이 no-op 이라
// 빌드/실행은 그대로 동작하고 수집만 비활성화된다(web 은 DSN 을 코드에 박았지만
// 앱은 스토어 바이너리로 배포돼 회수가 불가능하므로 env 로 뺀다).

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';

const isEnabled = () => SENTRY_DSN.length > 0 && !__DEV__;

export function initSentry() {
  if (!isEnabled()) {
    if (__DEV__ && SENTRY_DSN.length === 0) {
      console.warn(
        '[Sentry] EXPO_PUBLIC_SENTRY_DSN 미설정 — 에러 수집 비활성화(no-op).',
      );
    }
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,

    // OTA(expo-updates) 로 JS 만 바뀐 빌드를 구분한다. 이게 없으면 스토어 버전
    // 하나에 여러 OTA 릴리즈의 에러가 뭉쳐서 "어느 릴리즈가 깨뜨렸나"를 못 가린다.
    dist: Updates.updateId ?? undefined,

    // 성능 추적은 일단 끈다(무료 티어 쿼터를 크래시에 쓴다).
    // ponytail: tracesSampleRate 0, 실제로 성능 데이터가 필요해지면 올린다.
    tracesSampleRate: 0,

    // 이메일·소셜 로그인을 쓰므로 IP/유저 식별자는 보내지 않는다.
    sendDefaultPii: false,

    enableAutoPerformanceTracing: false,
  });

  // 어느 배포 채널(production/preview/test-*)에서 난 에러인지 가른다.
  // OTA 채널이 5개라 이게 없으면 내부 테스트 빌드 에러가 운영 지표를 오염시킨다.
  if (Updates.channel) {
    Sentry.setTag('update_channel', Updates.channel);
  }
}

/** 로그인 유저를 에러에 붙인다 — 특정 유저만 겪는 버그를 가리기 위함. */
export function setSentryUser(userId: string | null) {
  if (!isEnabled()) return;
  Sentry.setUser(userId ? {id: userId} : null);
}

export {Sentry};
