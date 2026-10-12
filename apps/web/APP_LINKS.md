# 앱 링크 검증 파일

앱(apps/mobile)이 `https://jirum-alarm.com/...` 링크를 브라우저 대신 직접 열기 위한
도메인 소유 증명 파일. 앱 쪽 짝은 iOS `jirumAlarmMobile.entitlements`(associated-domains)와
Android `AndroidManifest.xml`(autoVerify intent-filter).

## 배포 후 확인

```bash
# iOS — Content-Type 이 application/json 이어야 한다(octet-stream 이면 iOS 가 검증을 건너뜀)
curl -sI https://jirum-alarm.com/.well-known/apple-app-site-association | grep -i content-type

# Android
curl -s https://jirum-alarm.com/.well-known/assetlinks.json | python3 -m json.tool
```

## ⚠️ assetlinks.json 은 아직 미완이다

지금 들어 있는 지문은 **EAS 업로드 키**(`jirumalarm-upload`)의 것이다.
이 앱은 AAB 로 빌드해 Play 에 올리므로 **Play App Signing** 이 적용되고,
사용자 기기에 설치되는 APK 는 Google 이 다시 서명한다. App Links 검증은
**설치된 APK 의 서명 기준**이라, 업로드 키 지문만으로는 검증이 통과하지 않는다.

Play Console → 앱 → 테스트 및 released → **앱 서명** 화면의
"앱 서명 키 인증서" SHA-256 지문을 `sha256_cert_fingerprints` 배열에 **추가**할 것
(업로드 키 지문은 지우지 말고 둘 다 유지 — 내부 테스트 빌드는 업로드 키로 서명된다).

지문을 넣기 전까지 Android 는 커스텀 스킴(`jirumalarm://`)으로만 열리고,
https 링크는 기존처럼 브라우저로 간다(기능 후퇴는 없음).

### 앱 서명 키 지문(2026-10-12 Play Console 에서 확인) — 아직 넣지 않았다

```
54:99:F0:0B:85:F4:D7:A7:B2:96:84:F4:88:89:E6:08:CF:B4:87:C9:1F:15:F3:C9:6F:6D:13:A6:14:3C:C8:FB
```

⚠️ **넣기 전에 앱 매니페스트부터 경로를 좁혀야 한다.** iOS 는 범위를 서버(AASA components)가 정하지만
Android 는 앱의 intent-filter 가 정하는데, 지금 `AndroidManifest.xml` 의 autoVerify 필터는 `pathPrefix` 가 없어
**모든 경로**를 잡는다. 이 상태로 검증이 통과하면:

- 웹 카카오 로그인의 복귀(`kauth.kakao.com` → `/login/callback/kakao`, 사용자 탭에서 시작된 다른 도메인 리다이렉트)를
  크롬이 앱으로 넘겨 **앱이 깔린 안드로이드 사용자의 웹 로그인이 깨진다.**
- 인앱 브라우저 → 기본 브라우저 넘기기(`shared/lib/push-channel/browserHandoff.ts`, package 없는 https intent)가
  브라우저 대신 앱으로 간다.

순서: 매니페스트 필터를 AASA 와 같은 범위(`/products`·`/community`·`/trending`·`/curation`·`/toss`·`/deals`)의
`pathPrefix` 로 바꾸는 네이티브 변경(버전·runtimeVersion 올림 → 스토어 빌드) → 그 빌드가 퍼진 뒤 위 지문 추가.

**진행(2026-10-12)**: 매니페스트 범위 좁히기는 앱 **1.5.1**(31b80835)에 들어갔다. 남은 일 = 1.5.1 이 Play 에서
100% 출시되고 사용자 대부분이 올라간 뒤 위 지문을 `public/.well-known/assetlinks.json` 에 추가 → 웹 운영 배포.
그 전에 넣으면 아직 1.5.0 이하(전 경로 필터)를 새로 받거나 업데이트하는 기기에서 위 사고가 난다.
검증은 설치·업데이트 때 일어나므로 지문만 먼저 넣어도 지금 바이너리를 새로 받는 사람부터 전 경로가 잡힌다.

웹 「앱 열기」 버튼(`features/app-download/model/appHandoff.ts`)은 이 검증과 무관하다 — intent 에 package 를
지정해 검증 없이도 앱으로 간다.
