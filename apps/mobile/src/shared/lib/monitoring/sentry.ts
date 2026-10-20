import * as Sentry from '@sentry/react-native';
import * as Updates from 'expo-updates';
import {Analytics} from '@/shared/lib/analytics/ga4';
import {isOfflineError, queryErrorReportKey, queryName} from './query-errors';

// 앱(RN) 크래시·에러 수집. web 은 @sentry/nextjs 로 이미 보내고 있었지만
// 앱은 유저 폰에서 죽어도 아무 기록이 남지 않았다(유일한 신호가 스토어 리뷰).
// org 는 web 과 같은 jirumalarm, project 만 앱용으로 분리한다.
//
// DSN 은 EXPO_PUBLIC_SENTRY_DSN env 로 주입한다. 미설정이면 init 이 no-op 이라
// 빌드/실행은 그대로 동작하고 수집만 비활성화된다(web 은 DSN 을 코드에 박았지만
// 앱은 스토어 바이너리로 배포돼 회수가 불가능하므로 env 로 뺀다).

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';

const isEnabled = () => SENTRY_DSN.length > 0 && !__DEV__;

/**
 * 성능 추적 샘플 비율(2026-10-15 켬). 화면 전환마다 트랜잭션 하나 + 느린·멈춘 프레임·첫 화면 표시 시간이 붙는다.
 * 그 전엔 0 이라 FlashList·React Compiler 를 넣고도 실기기 체감 전후를 잴 방법이 없었다.
 * 오류와 성능(스팬)은 Sentry 쿼터가 따로라 크래시 수집을 깎지 않는다 — 성능 쿼터가 차면 성능만 버려진다.
 * 지금 앱 사용자 규모 × 화면 전환 하루 수십 번 → 5% 면 성능 쿼터 안에 든다.
 */
const TRACES_SAMPLE_RATE = 0.05;

let navigationIntegration:
  | ReturnType<typeof Sentry.reactNavigationIntegration>
  | undefined;

export function initSentry() {
  if (!isEnabled()) {
    if (__DEV__ && SENTRY_DSN.length === 0) {
      console.warn(
        '[Sentry] EXPO_PUBLIC_SENTRY_DSN 미설정 — 에러 수집 비활성화(no-op).',
      );
    }
    return;
  }

  // 화면 이름으로 트랜잭션을 나눈다 — NavigationContainer onReady 에서 registerSentryNavigation 으로 잇는다.
  navigationIntegration = Sentry.reactNavigationIntegration({
    enableTimeToInitialDisplay: true,
  });

  Sentry.init({
    dsn: SENTRY_DSN,

    // OTA(expo-updates) 로 JS 만 바뀐 빌드를 구분한다. 이게 없으면 스토어 버전
    // 하나에 여러 OTA 릴리즈의 에러가 뭉쳐서 "어느 릴리즈가 깨뜨렸나"를 못 가린다.
    dist: Updates.updateId ?? undefined,

    tracesSampleRate: TRACES_SAMPLE_RATE,
    integrations: [navigationIntegration],

    // 이메일·소셜 로그인을 쓰므로 IP/유저 식별자는 보내지 않는다.
    sendDefaultPii: false,

    // 앱 시작 시간·느린/멈춘 프레임(네이티브 측정) — 샘플된 트랜잭션에 붙는다.
    enableAutoPerformanceTracing: true,
  });

  // 어느 배포 채널(production/preview/test-*)에서 난 에러인지 가른다.
  // OTA 채널이 5개라 이게 없으면 내부 테스트 빌드 에러가 운영 지표를 오염시킨다.
  if (Updates.channel) {
    Sentry.setTag('update_channel', Updates.channel);
  }
  // 내장 번들로 뜬 실행인지(OTA 를 아직 못 받았거나 되돌아간 것) — dist 가 비어 있는 이유를 가른다.
  Sentry.setTag('embedded_launch', String(Updates.isEmbeddedLaunch));
}

/**
 * 루트 컴포넌트를 Sentry 로 감싼다 — **단 init 이 실제로 돈 경우에만.**
 *
 * 🔴`Sentry.wrap()` 은 init 없이 부르면 안 된다. 계측(App Start Span)이 켜지는데
 * 받아줄 클라이언트가 없어서 SDK 가 경고를 뱉고, 릴리스 빌드에선 시작 시점에
 * 앱이 죽는 원인이 된다(`App Start Span could not be finished. Sentry.wrap was
 * called before Sentry.init`).
 *
 * DSN 을 env 로 뺀 구조라 **DSN 미설정이 기본값에 가깝다** — 그 경우 wrap 도 같이
 * 건너뛰어야 짝이 맞는다. init 과 wrap 은 **항상 같은 조건으로 켜고 끈다.**
 */
export function wrapApp<T>(app: T): T {
  if (!isEnabled()) return app;
  return Sentry.wrap(app as never) as T;
}

/** 화면 전환 트랜잭션을 켠다 — NavigationContainer 가 준비되면 한 번. init 이 안 돌았으면 아무것도 안 한다. */
export function registerSentryNavigation(navigationRef: unknown) {
  navigationIntegration?.registerNavigationContainer(navigationRef);
}

/** 로그인 유저를 에러에 붙인다 — 특정 유저만 겪는 버그를 가리기 위함. */
export function setSentryUser(userId: string | null) {
  if (!isEnabled()) return;
  Sentry.setUser(userId ? {id: userId} : null);
}

/**
 * 지금 보고 있는 화면을 에러에 붙인다. 화면 전환 추적(tracing)은 5% 만 샘플하므로
 * 나머지 에러도 **어느 화면에서** 났는지 알 수 있게 태그로 남긴다. 이동 흔적은 breadcrumb 로.
 */
export function setSentryScreen(name: string) {
  if (!isEnabled()) return;
  Sentry.setTag('screen', name);
  Sentry.addBreadcrumb({category: 'navigation', message: name, level: 'info'});
}

// 같은 쿼리·같은 원인은 실행당 한 번만 보낸다 — 서버가 잠깐 죽으면 화면마다 수십 건이
// 쏟아져 무료 쿼터(크래시용)를 다 먹는다. 첫 건이 알려주는 사실로 충분하다.
const reportedQueryErrors = new Set<string>();

/**
 * react-query 쿼리·뮤테이션 실패를 보낸다. 화면은 실패를 「다시 시도」 칸으로 삼켜서
 * 서버 오류·응답 모양 변화(스키마 드리프트)가 **어디에도 기록되지 않았다.**
 * 네트워크 끊김·인증 만료·취소처럼 정상 흐름인 실패는 query-errors 가 걸러 낸다.
 */
export function captureQueryError(
  error: unknown,
  source: {kind: 'query' | 'mutation'; key: unknown},
) {
  if (!isEnabled()) return;
  const reportKey = queryErrorReportKey(error, source);
  if (!reportKey || reportedQueryErrors.has(reportKey)) return;
  reportedQueryErrors.add(reportKey);
  Sentry.captureException(error, {
    tags: {[source.kind]: queryName(source.key)},
    fingerprint: [reportKey],
  });
}

export type SilentFlow =
  | 'push_token'
  | 'push_bind'
  | 'push_unbind'
  | 'push_permission'
  | 'ota_check';

const reportedFlows = new Set<SilentFlow>();

/**
 * 앱 사용을 막지 않으려고 **삼키는** 실패(푸시 토큰 등록·계정 연결·OTA 확인)를 남긴다.
 *
 * 전엔 console.log 뿐이라 토큰 등록이 조용히 실패하면 그 기기는 키워드 알림이 끊긴 채로
 * 아무도 몰랐다(2026-10-20 감사). 네트워크 끊김은 빼고, 실행당 흐름마다 한 번만 보낸다 —
 * 같은 기기가 복귀할 때마다 같은 실패를 보내면 쿼터만 먹는다.
 */
export function captureSilentFailure(flow: SilentFlow, error: unknown) {
  if (!isEnabled() || reportedFlows.has(flow)) return;
  if (isOfflineError(error)) return;
  reportedFlows.add(flow);
  Sentry.captureException(error, {level: 'warning', tags: {flow}});
}

/**
 * OTA 가 깨져 내장 번들로 되돌아간 실행(emergency launch)을 남긴다.
 *
 * expo-updates 는 받은 업데이트가 실행에 실패하면 조용히 스토어 번들로 띄운다 — 사용자에겐
 * 「업데이트가 안 온 앱」으로만 보이고, 우리는 OTA 가 기기에서 죽었다는 걸 알 길이 없었다
 * (2026-10-01 실행 즉시 종료 OTA 도 원인을 못 가렸다). GA4 는 DSN 과 무관하게 항상 보낸다.
 */
export function reportEmergencyLaunch() {
  if (!Updates.isEmergencyLaunch) return;
  const reason = Updates.emergencyLaunchReason ?? 'unknown';
  Analytics.track('ota_emergency_launch', {reason, platform: 'app'});
  if (!isEnabled()) return;
  Sentry.captureMessage('expo-updates emergency launch', {
    level: 'warning',
    tags: {emergency_launch: 'true'},
    extra: {reason},
  });
}

export {Sentry};
