export {};

/**
 * iOS 네이티브 설정 가드 (Info.plist / pbxproj).
 *
 * ★ 이 테스트가 존재하는 이유: `expo prebuild` 는 bare workflow 에서도 Info.plist 를
 * **통째로 재생성**한다. 그때 손으로 넣은 설정이 조용히 사라지는데, 네이티브 plist 를
 * 읽는 테스트가 없어서 아무 장치도 이걸 못 잡았다.
 *
 * 실제 사고(`ef5b1c95` "iOS 프로젝트 생성물 — prebuild 산출 커밋", 2026-08-20 발견):
 *   - 카카오·네이버 URL 스킴이 사라짐 → AppDelegate 는 여전히 두 스킴을 라우팅하는데
 *     plist 에 등록이 없어 OAuth 콜백이 앱으로 돌아오지 못함 = 소셜 로그인 무응답
 *   - CFBundleShortVersionString 이 $(MARKETING_VERSION) → 리터럴 "1.4.2" 로 박힘
 *     → 버전을 올려도 1.4.2 로 출고되고, CFBundleVersion "1" 은 ASC 가 거부
 *   - UILaunchStoryboardName 이 디스크에 없는 SplashScreen 을 가리킴
 *   - PRODUCT_NAME 이 jirumAlarmMobile → app (moduleName·eas.json scheme 과 불일치)
 *
 * 당시 tsc·jest 380개·OTA 가드 15케이스·코드리뷰가 **전부 초록불**이었다.
 * 버전 정렬은 ota-updates-config.test.ts 가 보지만, 그 값이 실제 바이너리에
 * 반영되는지는 Info.plist 가 결정한다. 그래서 여기서 따로 묶는다.
 */

// @types/node 를 이 앱에 넣지 않으므로 인라인 require 를 쓴다(기존 테스트와 동일).
const fs = require('fs');
const path = require('path');

const read = (p: string): string =>
  fs.readFileSync(path.resolve(process.cwd(), p), 'utf8');
const exists = (p: string): boolean =>
  fs.existsSync(path.resolve(process.cwd(), p));

const INFO_PLIST = 'ios/jirumAlarmMobile/Info.plist';
const PBXPROJ = 'ios/jirumAlarmMobile.xcodeproj/project.pbxproj';

const infoPlist = read(INFO_PLIST);
const pbxproj = read(PBXPROJ);

/**
 * plist 파서를 새로 넣지 않는다(의존성 추가 없이 문자열 검사로 충분).
 * <string>값</string> 이 파일에 있는지만 본다 — 스킴 등록은 그 형태로만 쓰인다.
 */
const hasStringValue = (haystack: string, value: string): boolean =>
  haystack.includes(`<string>${value}</string>`);

describe('iOS Info.plist — 소셜 로그인 URL 스킴', () => {
  /**
   * 이 스킴들은 코드가 실제로 의존한다:
   *   - jirumalarmnaver: AppDelegate 의 NaverThirdPartyLoginConnection 분기 +
   *     src/screens/auth/useSocialLogin (NAVER_LOGIN_URL_SCHEME)
   *   - kakao{앱키}: AppDelegate 의 AuthController.handleOpenUrl 분기
   *     (@react-native-seoul/kakao-login 이 kakao*://oauth 로 콜백)
   * plist 에 없으면 iOS 가 콜백을 앱으로 안 보낸다 → 로그인이 조용히 멈춘다.
   */
  it('네이버 로그인 스킴이 등록돼 있다', () => {
    expect(hasStringValue(infoPlist, 'jirumalarmnaver')).toBe(true);
  });

  it('카카오 로그인 스킴이 등록돼 있다', () => {
    expect(
      hasStringValue(infoPlist, 'kakaoa14549f2c54214ea2a05669c34a3f11f'),
    ).toBe(true);
  });

  it('앱 딥링크 스킴이 등록돼 있다', () => {
    expect(hasStringValue(infoPlist, 'jirumalarm')).toBe(true);
  });

  it('AppDelegate 가 라우팅하는 스킴은 plist 에도 있어야 한다', () => {
    // AppDelegate 가 참조하는 스킴 문자열을 실제로 읽어와 대조한다.
    // (양쪽을 손으로 적으면 한쪽만 바뀌었을 때 이 테스트가 못 잡는다.)
    const appDelegate = read('ios/jirumAlarmMobile/AppDelegate.swift');
    const naverScheme = appDelegate.match(/url\.scheme == "([^"]+)"/)?.[1];

    expect(naverScheme).toBeTruthy();
    expect(hasStringValue(infoPlist, naverScheme as string)).toBe(true);
  });
});

describe('iOS Info.plist — 버전은 빌드 변수여야 한다', () => {
  /**
   * 리터럴로 박히면 MARKETING_VERSION/CURRENT_PROJECT_VERSION 을 올려도 무시된다.
   * 그러면 (a) 옛 버전으로 출고되고 (b) autoIncrement 가 무의미해지고
   * (c) 이미 쓴 빌드번호로 submit 하려다 ASC 가 거부한다.
   */
  it('CFBundleShortVersionString 은 $(MARKETING_VERSION) 이다', () => {
    expect(infoPlist).toContain('<string>$(MARKETING_VERSION)</string>');
  });

  it('CFBundleVersion 은 $(CURRENT_PROJECT_VERSION) 이다', () => {
    expect(infoPlist).toContain('<string>$(CURRENT_PROJECT_VERSION)</string>');
  });

  it('버전 자리에 리터럴 semver 가 박혀 있지 않다', () => {
    // CFBundleShortVersionString 바로 다음 <string> 이 리터럴이면 잡는다.
    const after = infoPlist.split('<key>CFBundleShortVersionString</key>')[1];
    expect(after).toBeTruthy();
    const firstValue = after.match(/<string>([^<]*)<\/string>/)?.[1];
    expect(firstValue).not.toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe('iOS Info.plist — 스플래시', () => {
  it('UILaunchStoryboardName 이 가리키는 스토리보드가 디스크에 있다', () => {
    // prebuild 가 존재하지 않는 SplashScreen 을 가리켜 놓은 이력이 있다.
    const name = infoPlist
      .split('<key>UILaunchStoryboardName</key>')[1]
      ?.match(/<string>([^<]*)<\/string>/)?.[1];

    expect(name).toBeTruthy();
    expect(exists(`ios/jirumAlarmMobile/${name}.storyboard`)).toBe(true);
  });
});

describe('iOS pbxproj', () => {
  it('PRODUCT_NAME 이 eas.json 의 scheme 과 일치한다', () => {
    // 불일치하면 빌드 산출물 이름이 갈려 스킴 지정 빌드가 엉뚱한 걸 집는다.
    const easJson = JSON.parse(read('eas.json'));
    const scheme = easJson.build.production.ios.scheme;

    const names = [...pbxproj.matchAll(/PRODUCT_NAME = ([^;]+);/g)].map(m =>
      m[1].trim(),
    );

    expect(names.length).toBeGreaterThan(0);
    expect(new Set(names).size).toBe(1);
    expect(names[0]).toBe(scheme);
  });

  it('존재하지 않는 파일을 참조하지 않는다 (storyboard)', () => {
    const referenced = [
      ...pbxproj.matchAll(/path = (jirumAlarmMobile\/[^;]*\.storyboard);/g),
    ].map(m => m[1]);

    for (const rel of referenced) {
      expect(exists(`ios/${rel}`)).toBe(true);
    }
  });

  it('Release 서명은 Manual + Apple Distribution 이다', () => {
    /**
     * Xcode 로 프로젝트를 열면 이 값이 Automatic/Apple Development 로
     * 되돌아간다(실제로 4회 재발). 그 상태로 스토어 빌드를 걸면
     * 프로비저닝 프로파일 불일치로 죽는다.
     */
    const releaseBlock = pbxproj
      .split('name = Release;')
      .slice(0, -1)
      .map(chunk => chunk.slice(-1500))
      .find(chunk => chunk.includes('CODE_SIGN_STYLE'));

    expect(releaseBlock).toBeTruthy();
    expect(releaseBlock).toContain('CODE_SIGN_STYLE = Manual;');
    expect(releaseBlock).toContain('CODE_SIGN_IDENTITY = "Apple Distribution"');
  });
});
