export {};

/**
 * OTA(expo-updates) 설정 가드.
 *
 * 이 설정이 틀리면 잘못된 JS 번들이 네이티브와 안 맞는 앱에 꽂혀 부팅 불가가 되고,
 * 그건 OTA 로 복구가 안 된다(스토어 재심사). 그래서 설정 자체를 테스트로 묶는다.
 *
 * ★ bare workflow 는 runtimeVersion "정책"을 아예 지원하지 않는다. EAS CLI 가
 * 업로드 후 거부한다:
 *   "You're currently using the bare workflow, where runtime version policies
 *    are not supported. You must set your runtime version manually."
 * 이것이 빌드 4회 실패의 진짜 이유다. fingerprint 로 3회(730a92fe·aa1fd56c·
 * 4a8ab160) 실패하며 해시 불일치를 쫓았는데, 애초에 정책 자체가 안 되는 환경이었다.
 * → runtimeVersion 은 반드시 리터럴 문자열.
 *
 * 그 대가로 정렬이 사람 책임이 된다. runtimeVersion 이 앱 버전과 갈리면
 * 업데이트가 엉뚱한 빌드에 꽂히거나 아무 빌드에도 안 꽂힌다. 과거 실제로
 * 세 곳이 갈려 있었다(app.json 1.3.9 / ios 1.4.1 / android 1.3.7).
 * 그래서 아래 "버전 정렬" 테스트가 유일한 안전장치다.
 */

// @types/node 를 이 앱에 넣지 않으므로 인라인 require 를 쓴다(기존 테스트와 동일).
const fs = require('fs');
const path = require('path');

const read = (p: string): string =>
  fs.readFileSync(path.resolve(process.cwd(), p), 'utf8');
const exists = (p: string): boolean =>
  fs.existsSync(path.resolve(process.cwd(), p));

const appJson = JSON.parse(read('app.json'));
const easJson = JSON.parse(read('eas.json'));

const EXPECTED_URL = `https://u.expo.dev/${appJson.expo.extra.eas.projectId}`;

describe('OTA 설정 — app.json', () => {
  it('runtimeVersion 은 리터럴 문자열이다 (bare 는 정책 미지원)', () => {
    // 객체({policy:...})면 EAS CLI 가 빌드를 거부한다.
    expect(typeof appJson.expo.runtimeVersion).toBe('string');
    expect(appJson.expo.runtimeVersion).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('업데이트 URL 은 EAS projectId 와 일치한다', () => {
    expect(appJson.expo.updates.url).toBe(EXPECTED_URL);
  });

  it('부팅을 업데이트 다운로드로 막지 않는다', () => {
    expect(appJson.expo.updates.fallbackToCacheTimeout).toBe(0);
  });
});

describe('OTA 설정 — eas.json 채널', () => {
  // 채널이 없으면 그 프로필 빌드는 업데이트를 영구히 못 받는다(조용히 실패).
  it('모든 빌드 프로필에 채널이 있다', () => {
    for (const [name, profile] of Object.entries<any>(easJson.build)) {
      expect(profile.channel).toBeTruthy();
      expect(typeof profile.channel).toBe('string');
      expect(name).toBeTruthy();
    }
  });

  it('채널은 프로필마다 고유하다 — env 가 다른 빌드가 서로의 번들을 받으면 안 된다', () => {
    const channels = Object.values<any>(easJson.build).map(p => p.channel);
    expect(new Set(channels).size).toBe(channels.length);
  });

  it('스토어 배포 프로필은 ios.scheme 를 명시한다', () => {
    // 이 프로젝트엔 스킴이 2개(jirumAlarmMobile, jirumAlarmMobileDebug)라
    // 명시하지 않으면 EAS 가 추측한다 → Debug 스킴이 잡히면 스토어 아카이브가 안 된다.
    for (const name of ['test-prod', 'production']) {
      expect(easJson.build[name].ios.scheme).toBe('jirumAlarmMobile');
    }
  });
});

describe('OTA 설정 — 앱 버전 3곳 정렬 (appVersion 정책의 안전장치)', () => {
  /**
   * appVersion 정책은 runtimeVersion = 앱 버전이다. 세 소스가 갈리면
   * 플랫폼별로 다른 runtimeVersion 이 나와서, 업데이트가 엉뚱한 빌드에 꽂힌다.
   * 과거 실제로 갈려 있었다: app.json 1.3.9 / ios 1.4.1 / android 1.3.7.
   */
  const pbxproj = read('ios/jirumAlarmMobile.xcodeproj/project.pbxproj');
  const gradle = read('android/app/build.gradle');

  const iosVersions = [
    ...pbxproj.matchAll(/MARKETING_VERSION = ([^;]+);/g),
  ].map(m => m[1].trim());
  const androidVersion = gradle.match(/versionName "([^"]+)"/)?.[1];
  const appJsonVersion = appJson.expo.version;

  it('iOS 의 모든 configuration 이 같은 버전이다', () => {
    // Debug/Release 중 하나만 올리는 실수가 잦다.
    expect(iosVersions.length).toBeGreaterThan(0);
    expect(new Set(iosVersions).size).toBe(1);
  });

  it('app.json / ios / android 가 모두 같은 버전이다', () => {
    expect(androidVersion).toBe(appJsonVersion);
    expect(iosVersions[0]).toBe(appJsonVersion);
  });

  it('runtimeVersion 이 앱 버전과 일치한다 (수동 관리라 갈리기 쉽다)', () => {
    // 갈리면 업데이트가 엉뚱한 빌드에 꽂히거나 아무 빌드에도 안 꽂힌다.
    expect(appJson.expo.runtimeVersion).toBe(appJsonVersion);
  });
});

describe('OTA 설정 — Supporting/Expo.plist 는 반드시 커밋돼 있어야 한다', () => {
  /**
   * ★빌드 7회 실패의 진짜 원인. EAS 로그의 err 필드에 있었다:
   *   Error: .../ios/jirumAlarmMobile/Supporting/Expo.plist does not exist
   *     at iosSetChannelNativelyAsync
   *
   * EAS 는 이 파일이 **이미 있어야** 그 안에 채널(expo-channel-name)을 써넣는다.
   * 그런데 ios/ 가 커밋된 bare 프로젝트에서는 EAS 가 prebuild 를 skip 하므로
   * (로그: "Skipped running expo prebuild because the ios directory already exists")
   * 플러그인이 EAS 쪽에서 이 파일을 만들어주지 않는다 → 커밋이 유일한 공급 경로.
   *
   * 로컬은 pnpm install 때 플러그인이 만들어주므로 "있으니 됐다"고 착각하기 쉽다.
   */
  const plistPath = 'ios/jirumAlarmMobile/Supporting/Expo.plist';

  it('파일이 존재한다', () => {
    expect(exists(plistPath)).toBe(true);
  });

  it('gitignore 되지 않는다 (되면 EAS 트리에서 사라진다)', () => {
    expect(read('../../.gitignore')).not.toContain('Supporting/Expo.plist');
  });

  it('URL·runtimeVersion 이 app.json 과 일치한다', () => {
    // 플러그인 생성물이라 app.json 에서 파생된다. 갈리면 app.json 을 고치고 재생성.
    const plist = read(plistPath);
    expect(plist).toContain(EXPECTED_URL);
    expect(plist).toContain(`<string>${appJson.expo.runtimeVersion}</string>`);
  });

  /**
   * 🔴 채널이 없으면 OTA 는 **영구히 도달하지 않는다**(2026-08-20 실측).
   * 앱은 매니페스트를 받을 때 `expo-channel-name` 헤더를 보내야 하고,
   * 그 값의 출처가 EXUpdatesRequestHeaders 다. 없으면 서버가 400 을 준다:
   *   "channel-name": Required. The headers "expo-runtime-version",
   *   "expo-channel-name", and "expo-platform" are required.
   *
   * ★ 증상이 "업데이트가 안 온다" 뿐이라 발행 쪽을 의심하게 된다 —
   * eas update 는 성공하고 update:list 에도 뜨는데 기기만 못 받는다.
   * build 25 가 이 상태로 스토어 심사까지 올라갔다.
   */
  it('채널 헤더가 박혀 있다 — 없으면 서버가 400 을 준다', () => {
    const plist = read(plistPath);
    expect(plist).toContain('EXUpdatesRequestHeaders');
    expect(plist).toContain('expo-channel-name');
  });

  it('채널이 eas.json production 프로필과 일치한다', () => {
    // 갈리면 발행한 브랜치와 앱이 보는 채널이 어긋나 업데이트가 안 꽂힌다.
    const plist = read(plistPath);
    const channel = easJson.build.production.channel;
    const after = plist.split('expo-channel-name')[1];
    expect(after).toBeTruthy();
    expect(after.match(/<string>([^<]*)<\/string>/)?.[1]).toBe(channel);
  });
});

describe('OTA 설정 — Expo.plist 는 번들에 실려야 한다', () => {
  /**
   * 🔴🔴 2026-08-20 정정. 여기 있던 "pbxproj 에 수동 등록하지 않는다" 는 **틀렸고,
   * 그 단정이 깨진 상태를 3개 빌드(23·24·25) 동안 고정했다.**
   *
   * 착각: expo-updates 플러그인이 빌드 때 Expo.plist 를 만들어 등록해 준다.
   * 실제: 이 레포는 **bare workflow**(ios/ 가 커밋됨)라 EAS 빌드에서 prebuild 가
   * 돌지 않는다 → 플러그인도 안 돈다. 파일은 레포에 있지만 **Xcode 프로젝트에
   * 등록돼 있지 않아 번들에 복사되지 않았다.**
   *
   * 결과: build 26 IPA 를 열어보니 EXUpdates* 키가 **하나도 없었다**
   * (앱 Info.plist·번들 전체에 `expo-channel-name` 문자열조차 없음).
   * 채널이 없으니 서버가 매니페스트 요청을 400 으로 거절 → OTA 영구 불가.
   *
   * ★ 교훈: "플러그인이 알아서 해 준다" 는 managed workflow 전제다.
   * bare 에서는 **생성물을 커밋하고 프로젝트에 등록까지** 해야 한다.
   * 검증은 pbxproj 가 아니라 **IPA 안에 실제로 있는지**로 해야 한다.
   */
  it('iOS: Expo.plist 가 Resources 빌드 페이즈에 등록돼 있다', () => {
    // 등록이 없으면 Xcode 가 번들에 복사하지 않아 설정이 통째로 사라진다.
    const pbxproj = read('ios/jirumAlarmMobile.xcodeproj/project.pbxproj');
    expect(pbxproj).toContain('Expo.plist in Resources');
  });

  it('iOS: 등록된 경로가 실제 파일을 가리킨다', () => {
    const pbxproj = read('ios/jirumAlarmMobile.xcodeproj/project.pbxproj');
    const path = pbxproj.match(
      /path = (jirumAlarmMobile\/Supporting\/Expo\.plist);/,
    )?.[1];
    expect(path).toBeTruthy();
    expect(exists(`ios/${path}`)).toBe(true);
  });

  it('iOS: 타겟 루트에 경쟁하는 Expo.plist 가 없다', () => {
    // Supporting/ 이 정본. 루트에 또 있으면 어느 쪽이 실릴지 불명확해진다.
    expect(exists('ios/jirumAlarmMobile/Expo.plist')).toBe(false);
  });

  it('Android: manifest 에 updates meta-data 를 수동으로 넣지 않는다', () => {
    const manifest = read('android/app/src/main/AndroidManifest.xml');
    expect(manifest).not.toContain('expo.modules.updates');
  });
});
