export {};

/**
 * OTA(expo-updates) 설정 가드.
 *
 * 이 설정이 틀리면 잘못된 JS 번들이 네이티브와 안 맞는 앱에 꽂혀 부팅 불가가 되고,
 * 그건 OTA 로 복구가 안 된다(스토어 재심사). 그래서 설정 자체를 테스트로 묶는다.
 *
 * 특히 runtimeVersion 정책: 이 레포는 앱 버전이 app.json / ios pbxproj / android gradle
 * 3곳에서 갈려 있었다(1.3.9 / 1.4.1 / 1.3.7). appVersion 정책은 네이티브 값을 읽고
 * app.json 을 안 보므로 플랫폼별로 다른 runtimeVersion 이 나온다 → fingerprint 만 허용.
 */

// @types/node 를 이 앱에 넣지 않으므로 인라인 require 를 쓴다(기존 테스트와 동일).
const fs = require('fs');
const path = require('path');

const read = (p: string): string =>
  fs.readFileSync(path.resolve(process.cwd(), p), 'utf8');

const appJson = JSON.parse(read('app.json'));
const easJson = JSON.parse(read('eas.json'));

const EXPECTED_URL = `https://u.expo.dev/${appJson.expo.extra.eas.projectId}`;

describe('OTA 설정 — app.json', () => {
  it('runtimeVersion 은 fingerprint 정책이다 (appVersion 은 크래시 함정)', () => {
    expect(appJson.expo.runtimeVersion).toEqual({policy: 'fingerprint'});
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
});

describe('OTA 설정 — fingerprint 재현성', () => {
  /**
   * 실제로 빌드를 깨뜨린 회귀(빌드 730a92fe):
   * eas-build-pre-install 훅이 EAS 에서 시크릿을 ios/·android/ 안에 복원하는데,
   * 그 파일들은 gitignore 라 로컬엔 없다 → ios 디렉토리 해시가 갈리고
   * CONFIGURE_EXPO_UPDATES 단계에서 "Runtime version mismatch" 로 빌드 실패.
   *
   * 훅이 복원하는 모든 경로는 .fingerprintignore 에 있어야 한다.
   */
  const ignore = read('.fingerprintignore');
  const restoreScript = read('scripts/eas-restore-build-files.mjs');

  const RESTORED_PATHS = [
    'ios/GoogleService-Info.plist',
    'android/app/google-services.json',
  ];

  it('복원 스크립트가 실제로 그 경로들을 쓴다 (테스트가 현실과 안 갈리게)', () => {
    for (const p of RESTORED_PATHS) {
      expect(restoreScript).toContain(p);
    }
  });

  it('훅이 복원하는 경로는 모두 fingerprint 에서 제외된다', () => {
    for (const p of RESTORED_PATHS) {
      expect(ignore).toContain(p);
    }
  });
});

describe('OTA 설정 — 네이티브 배선', () => {
  const plist = read('ios/jirumAlarmMobile/Expo.plist');
  const manifest = read('android/app/src/main/AndroidManifest.xml');

  it('iOS: Expo.plist 가 fingerprint sentinel 을 쓴다 (버전 하드코딩 금지)', () => {
    // "file:fingerprint" 는 expo-updates sentinel — 빌드 시 실제 해시로 채워진다.
    expect(plist).toContain('<key>EXUpdatesRuntimeVersion</key>');
    expect(plist).toMatch(
      /EXUpdatesRuntimeVersion<\/key>\s*<string>file:fingerprint<\/string>/,
    );
  });

  it('iOS: Expo.plist 의 URL 이 app.json 과 일치한다', () => {
    expect(plist).toContain(EXPECTED_URL);
  });

  it('iOS: Expo.plist 가 Xcode 타깃 리소스로 등록돼 있다', () => {
    // Bundle.main 에서 읽으므로 Resources 빌드 페이즈에 없으면 런타임에 못 찾는다.
    const pbxproj = read('ios/jirumAlarmMobile.xcodeproj/project.pbxproj');
    expect(pbxproj).toContain('Expo.plist in Resources');
    expect(pbxproj).toMatch(/path = jirumAlarmMobile\/Expo\.plist/);
  });

  it('Android: manifest 에 URL 과 ENABLED 가 있다', () => {
    expect(manifest).toContain('expo.modules.updates.ENABLED');
    expect(manifest).toContain('expo.modules.updates.EXPO_UPDATE_URL');
    expect(manifest).toContain(EXPECTED_URL);
  });

  it('Android: manifest 에 runtimeVersion 을 박지 않는다 (fingerprint 를 덮어버린다)', () => {
    // EXPO_RUNTIME_VERSION 이 있으면 fingerprint 대신 그 값이 쓰인다 → 불일치 위험.
    expect(manifest).not.toContain('EXPO_RUNTIME_VERSION');
  });
});
