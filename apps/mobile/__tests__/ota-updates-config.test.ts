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
});

describe('OTA 설정 — 네이티브 배선은 손으로 하지 않는다', () => {
  /**
   * expo-updates 는 app.plugin.js 를 자동 등록하고, 그 플러그인이
   * IOSConfig.Updates.withUpdates / AndroidConfig.Updates.withUpdates 로
   * ios/<target>/Supporting/Expo.plist 와 AndroidManifest meta-data 를 생성한다.
   *
   * 손으로 같은 값을 또 넣으면 생성물과 경쟁해 ios 디렉토리 해시가 흔들리고,
   * runtime version mismatch 로 빌드가 죽는다(빌드 730a92fe·aa1fd56c).
   * 그래서 "있어야 한다"가 아니라 "없어야 한다"를 검사한다.
   */
  it('iOS: 손으로 만든 Expo.plist 가 없다 (플러그인 생성물과 경쟁)', () => {
    expect(exists('ios/jirumAlarmMobile/Expo.plist')).toBe(false);
  });

  it('iOS: pbxproj 에 Expo.plist 를 수동 등록하지 않는다', () => {
    const pbxproj = read('ios/jirumAlarmMobile.xcodeproj/project.pbxproj');
    expect(pbxproj).not.toContain('Expo.plist in Resources');
  });

  it('Android: manifest 에 updates meta-data 를 수동으로 넣지 않는다', () => {
    const manifest = read('android/app/src/main/AndroidManifest.xml');
    expect(manifest).not.toContain('expo.modules.updates');
  });
});
