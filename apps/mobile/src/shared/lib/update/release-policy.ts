import {Platform} from 'react-native';

import {SERVICE_URL} from '@/constants/env';
import {compareVersion, isBelowMinimum} from './version';

/**
 * 앱 업데이트 정책 — web 이 서빙하는 정적 JSON(`/app-release.json`) 하나로 두 단계를 정한다.
 *
 * - `minSupportedVersion`(강제): 이 미만은 앱을 막고 스토어로 보낸다. **옛 버전이 실제로 깨질 때만**
 *   올린다(API 변경·보안). 평소엔 올리지 않는다 — 막는 화면은 그 자체로 나쁜 경험이다.
 * - `latestVersion`(권유): 이 미만이면 "새 버전이 나왔어요" 를 버전당 한 번 권한다. 닫으면 끝.
 *   새 스토어 버전이 출시되면 올린다.
 *
 * 앱 실행당 한 번만 받는다(강제·권유가 같은 응답을 나눠 쓴다). 캐시된 옛 정책을 읽으면
 * 값을 올려도 안 먹으므로 no-cache. 못 읽으면 null — 정책을 몰라 앱을 막는 일은 없다.
 */
export type ReleasePolicy = {
  minSupportedVersion: string;
  latestVersion: string;
};

let pending: Promise<ReleasePolicy | null> | null = null;

export function fetchReleasePolicy(): Promise<ReleasePolicy | null> {
  if (!pending) {
    pending = (async () => {
      try {
        const res = await fetch(`${SERVICE_URL}/app-release.json`, {
          headers: {'Cache-Control': 'no-cache'},
        });
        if (!res.ok) return null;
        const json = (await res.json()) as Record<
          string,
          {minSupportedVersion?: string; latestVersion?: string} | undefined
        >;
        const p = json[Platform.OS];
        return {
          minSupportedVersion: p?.minSupportedVersion ?? '',
          latestVersion: p?.latestVersion ?? '',
        };
      } catch {
        // ponytail: 실패 시 재시도 없음. 다음 앱 실행에서 다시 본다.
        return null;
      }
    })();
  }
  return pending;
}

/**
 * 권유 시트를 띄울까. 강제 대상이면 강제 화면이 맡으므로 띄우지 않는다.
 * 이미 이 latest 를 한 번 권했으면(닫았든 눌렀든) 다시 안 띄운다.
 */
export function shouldOfferUpdate(
  current: string,
  policy: ReleasePolicy | null,
  lastOfferedVersion: string | null,
): boolean {
  if (!policy || !current || !policy.latestVersion) return false;
  if (isBelowMinimum(current, policy.minSupportedVersion)) return false;
  if (compareVersion(current, policy.latestVersion) >= 0) return false;
  return lastOfferedVersion !== policy.latestVersion;
}

/** web shared/config/appStore.ts 와 같은 앱. iOS 는 스토어프론트를 붙이지 않는다(다른 국가 계정에서 안 열림). */
export const STORE_URL = {
  ios: 'https://apps.apple.com/app/id6474611420',
  android: 'https://play.google.com/store/apps/details?id=com.solcode.jirmalam',
} as const;

export const storeUrl = () =>
  STORE_URL[Platform.OS === 'ios' ? 'ios' : 'android'];

/** 테스트용 — 실행당 1회 캐시를 비운다. */
export function __resetReleasePolicyForTest() {
  pending = null;
}
