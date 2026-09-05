import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

/**
 * Android App Links 가드 — `/.well-known/assetlinks.json`.
 *
 * 이 파일이 틀리면 증상은 "공유 링크가 브라우저로 열린다" 하나뿐이라
 * 앱 코드(인텐트 필터)를 의심하게 된다. 실제 원인은 여기인 경우가 많다.
 *
 * ★★ 지문이 "업로드 키" 하나만 있으면 검증은 **실패한다.**
 * AAB 를 올리면 Play 가 앱을 **자기 키로 재서명**한다. 기기에 설치된 APK 의
 * 서명은 업로드 키가 아니라 **Play 앱 서명 키**이고, Android 는 설치된 APK
 * 기준으로 이 파일을 대조한다. 즉 필요한 건 둘 다다:
 *   - Play 앱 서명 키 (Play Console → 앱 무결성 → 앱 서명 키 인증서)  ← 필수
 *   - 업로드 키 (EAS "Google Play Upload Key")                      ← 로컬/내부 테스트용
 *
 * 2026-09-05 실측: 운영 파일에 지문이 **1개뿐**이었고, 그 값
 * 54:A6:...:3A:A2 는 EAS 업로드 키 지문과 정확히 일치했다.
 * = Play 앱 서명 키가 빠져 있다.
 *
 * 이 테스트는 "지문이 2개 이상"을 강제하지 않는다 — Play 앱 서명 키 값을
 * 사람이 Play Console 에서 가져와야 하고, 그전까지 빨간불로 막으면 무관한
 * 작업까지 멈춘다. 대신 **형식이 깨지는 것**과 **패키지명이 갈리는 것**을 막고,
 * 지문이 1개면 그 사실이 눈에 띄게 남긴다.
 */

const ASSETLINKS = new URL('../../../public/.well-known/assetlinks.json', import.meta.url);

/** 앱의 applicationId. android/app/build.gradle 과 반드시 같아야 한다. */
const PACKAGE_NAME = 'com.solcode.jirmalam';

/** EAS 에 등록된 "Google Play Upload Key" 지문(2026-09-05 조회). */
const UPLOAD_KEY_FINGERPRINT =
  '54:A6:A6:7F:32:DB:87:78:E2:83:A6:F0:27:21:B4:D0:89:53:50:2F:94:78:EC:AE:BF:B8:23:13:F6:1E:3A:A2';

type AssetLink = {
  relation: string[];
  target: {
    namespace: string;
    package_name: string;
    sha256_cert_fingerprints: string[];
  };
};

const parsed: AssetLink[] = JSON.parse(readFileSync(ASSETLINKS, 'utf8'));

describe('assetlinks.json — Android App Links', () => {
  it('배열이고 항목이 최소 1개다', () => {
    assert.ok(Array.isArray(parsed));
    assert.ok(parsed.length >= 1);
  });

  it('패키지명이 앱의 applicationId 와 같다', () => {
    // 갈리면 검증이 조용히 실패한다(에러 없이 그냥 브라우저로 열림).
    const packages = parsed.map((entry) => entry.target.package_name);
    assert.ok(packages.includes(PACKAGE_NAME));
  });

  it('handle_all_urls 권한을 위임한다', () => {
    const entry = parsed.find((e) => e.target.package_name === PACKAGE_NAME);
    assert.ok(entry);
    assert.ok(entry.relation.includes('delegate_permission/common.handle_all_urls'));
    assert.equal(entry.target.namespace, 'android_app');
  });

  it('지문이 SHA-256 형식이다 (콜론 구분 32바이트)', () => {
    const entry = parsed.find((e) => e.target.package_name === PACKAGE_NAME);
    assert.ok(entry);
    for (const fingerprint of entry.target.sha256_cert_fingerprints) {
      assert.match(fingerprint, /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/);
    }
  });

  it('지문에 중복이 없다', () => {
    const entry = parsed.find((e) => e.target.package_name === PACKAGE_NAME);
    assert.ok(entry);
    const list = entry.target.sha256_cert_fingerprints;
    assert.equal(new Set(list).size, list.length);
  });

  /**
   * ★ 현재 알려진 결함을 명시적으로 고정해 둔다.
   * Play 앱 서명 키 지문을 추가하면 이 테스트가 빨간불이 되고, 그때
   * 아래 주석대로 기대값을 바꾸면 된다 — "고쳤는데 아무도 모르는" 상태를 막는다.
   */
  it('업로드 키만 있는 현재 상태를 기록한다 (Play 앱 서명 키 추가 시 이 테스트를 갱신)', () => {
    const entry = parsed.find((e) => e.target.package_name === PACKAGE_NAME);
    assert.ok(entry);
    const list = entry.target.sha256_cert_fingerprints;

    if (list.length === 1) {
      // 아직 업로드 키뿐 — App Links 자동 검증은 실패한다.
      assert.equal(list[0], UPLOAD_KEY_FINGERPRINT);
      return;
    }

    // 지문이 늘었다면 업로드 키는 그대로 있고, 다른 키(=Play 앱 서명 키)가 추가된 것이어야 한다.
    assert.ok(list.includes(UPLOAD_KEY_FINGERPRINT));
    assert.ok(list.some((f) => f !== UPLOAD_KEY_FINGERPRINT));
  });
});
