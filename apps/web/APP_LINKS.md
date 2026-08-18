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
