import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 디퍼드 딥링크(안드로이드) — 웹에서 「앱 열기/받기」를 눌렀는데 앱이 없어 Play 로 간 사람이 설치 후 처음 켜면,
 * 웹에서 보던 화면으로 보낸다.
 *
 * 웹(apps/web/src/features/app-download/model/appHandoff.ts)이 Play 주소의 referrer 에
 * `utm_campaign=app_handoff&jirum_path=<경로>` 를 싣고, Play 는 설치 뒤 그 값을 Install Referrer 로 돌려준다.
 * 네이티브 모듈(expo-application — expo-notifications 의존으로 이미 자동 링크돼 있다)만 쓰므로 OTA 로 나간다.
 * iOS 는 같은 통로가 없다(클립보드 방식은 붙여넣기 허락 팝업이 떠서 하지 않는다).
 */

const CHECKED_KEY = 'jirum:deferred-link-checked';
/** 설치 직후 첫 실행만. 업데이트로 이 코드를 처음 받은 옛 설치자가 몇 주 전 referrer 로 엉뚱한 상품에 떨어지지 않게. */
const FRESH_INSTALL_MS = 24 * 60 * 60 * 1000;
/** Play 서비스가 없는 기기(일부 에뮬레이터·화웨이)에서 응답 없이 매달리지 않게. */
const REFERRER_TIMEOUT_MS = 3000;

/**
 * Play referrer 문자열에서 열 경로를 꺼낸다. 우리 넘기기 캠페인이고 우리 경로 모양일 때만 —
 * 남이 만든 Play 링크(광고 등)의 referrer 를 따라가지 않는다.
 */
const HANDOFF_PATH =
  /^\/[A-Za-z0-9/_-]+(\?(keyword|tab)=[A-Za-z0-9%._~-]+(&(keyword|tab)=[A-Za-z0-9%._~-]+)?)?$/;

export function parseHandoffReferrer(
  referrer: string | null | undefined,
): string | null {
  const params = readHandoffParams(referrer);
  if (!params) return null;
  const path = params.get('jirum_path') ?? '';
  // '/' 는 열 게 없다(앱은 원래 홈으로 뜬다). 경로 문자만 허용 — 호스트·스킴을 못 싣게.
  // 쿼리는 화면이 읽는 검색어·탭(web normalizeHandoffPath 의 HANDOFF_QUERY_KEYS)만 — 검색 결과에서 넘어온
  // 사람이 설치 뒤 빈 검색 화면을 보지 않게.
  if (path === '/' || !HANDOFF_PATH.test(path) || path.startsWith('//'))
    return null;
  return path;
}

/**
 * 웹 게스트 기기 id(jirum_gd) — 웹에서 게스트로 키워드를 건 사람이면 앱이 같은 게스트를 이어받는다
 * (screens/auth/useAdoptWebGuest). 기기 id 모양만.
 */
export function parseHandoffReferrerGuest(
  referrer: string | null | undefined,
): string | null {
  const id = readHandoffParams(referrer)?.get('jirum_gd') ?? '';
  return /^[0-9a-z-]{16,64}$/i.test(id) ? id : null;
}

/** 우리 넘기기 캠페인의 referrer 만 읽는다 — 남이 만든 Play 링크(광고 등)의 값을 따르지 않는다. */
function readHandoffParams(
  referrer: string | null | undefined,
): Map<string, string> | null {
  if (!referrer) return null;
  const params = new Map<string, string>();
  for (const pair of referrer.split('&')) {
    const eq = pair.indexOf('=');
    if (eq <= 0) continue;
    try {
      params.set(
        pair.slice(0, eq),
        decodeURIComponent(pair.slice(eq + 1).replace(/\+/g, ' ')),
      );
    } catch {
      return null;
    }
  }
  if (params.get('utm_campaign') !== 'app_handoff') return null;
  return params;
}

export function isFreshInstall(
  installedAt: Date,
  now: Date = new Date(),
): boolean {
  const age = now.getTime() - installedAt.getTime();
  return age >= 0 && age < FRESH_INSTALL_MS;
}

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T | null> =>
  Promise.race([
    promise,
    new Promise<null>(resolve => setTimeout(() => resolve(null), ms)),
  ]);

export type DeferredDeepLink = {
  /** 열 화면(없으면 홈 그대로). */
  path: string | null;
  /** 이어받을 웹 게스트 기기 id. */
  guestDeviceId: string | null;
};

/** 한 번만 읽는다(읽기 전에 표시) — 다음 실행부터는 바로 null. 실패는 전부 null(홈으로 뜨는 지금 그대로). */
export async function readDeferredDeepLink(): Promise<DeferredDeepLink | null> {
  if (Platform.OS !== 'android') return null;
  try {
    if (await AsyncStorage.getItem(CHECKED_KEY)) return null;
    await AsyncStorage.setItem(CHECKED_KEY, '1');
    // 지연 require — iOS·테스트 환경에서 네이티브 모듈을 건드리지 않는다.
    const Application =
      require('expo-application') as typeof import('expo-application');
    const installedAt = await withTimeout(
      Application.getInstallationTimeAsync(),
      REFERRER_TIMEOUT_MS,
    );
    if (!installedAt || !isFreshInstall(installedAt)) return null;
    const referrer = await withTimeout(
      Application.getInstallReferrerAsync(),
      REFERRER_TIMEOUT_MS,
    );
    return {
      path: parseHandoffReferrer(referrer),
      guestDeviceId: parseHandoffReferrerGuest(referrer),
    };
  } catch {
    return null;
  }
}
