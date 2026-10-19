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

## assetlinks.json — 지문 두 개

- `54:A6:…:3A:A2` — **EAS 업로드 키**(`jirumalarm-upload`). 내부 테스트 빌드가 이 키로 서명된다.
- `54:99:…:C8:FB` — **Play 앱 서명 키**(Play Console → 앱 서명, 2026-10-12 확인). 스토어에서 받은 앱은 Google 이
  다시 서명하므로 이게 있어야 검증이 통과한다. **2026-10-16 추가.**

업로드 키 지문만 있던 동안 Android 는 https 링크를 늘 브라우저로 열었다(커스텀 스킴은 동작).

### 왜 10/16 에야 넣었나 — 매니페스트 범위가 먼저였다

iOS 는 범위를 서버(AASA components)가 정하지만 Android 는 앱의 intent-filter 가 정한다. 1.5.0 이하의 autoVerify 필터는
`pathPrefix` 없이 **모든 경로**를 잡아서, 검증이 통과하면 웹 카카오 로그인 복귀(`kauth.kakao.com` → `/login/callback/kakao`)와
인앱 → 기본 브라우저 넘기기(`browserHandoff.ts`, package 없는 https intent)를 크롬이 앱으로 넘겨 웹 로그인이 깨진다.

그래서 앱 **1.5.1** 에서 필터를 `pathPrefix` 6개로 좁혔고, Play 프로덕션이 **1.5.3 전체 출시**(eas.json `releaseStatus: completed`)가
된 뒤 지문을 넣었다. 검증은 설치·업데이트 때 일어나므로 옛 바이너리(전 경로 필터)가 깔린 기기는 업데이트 전까지 검증되지 않고
(지금처럼 브라우저), 업데이트하면 좁힌 필터를 받는다. ⚠️ Play 프로덕션을 1.5.0 이하로 되돌리는 일이 생기면 이 지문부터 뺄 것.

### 1.5.4 에서 경로를 AASA 에 맞췄다(2026-10-16)

매니페스트 `pathPrefix` 는 끝 슬래시까지 비교한다 — `/toss/` 는 실제 페이지 `/toss` 를 못 잡는다. 1.5.4 매니페스트에
`android:path` 로 `/toss`·`/community`·`/trending`·`/search` 를 더하고, 앱이 열지 않는 `/deals/` 는 뺐다(AASA 와 같은 범위).
1.5.3 이하 바이너리는 업데이트 전까지 이 네 경로가 브라우저로 열린다.

### `/keywords/*` — iOS 는 10/17 바로, Android 는 1.5.6 부터

키워드 핫딜 화면(앱 1.5.5+ KeywordHubScreen)이 생겨 AASA 에 `/keywords/*` 를 더했다(목록 `/keywords` 는 앱 화면이 없어 뺀다).
옛 앱(1.5.4 이하)은 모르는 경로를 앱 안 웹뷰로 연다(tab-routing `allowWebViewRoute`). Android 는 매니페스트 `pathPrefix="/keywords/"`
가 필요한 네이티브 변경이라 `native/1.5.6-batch` 에 넣었다 — 그 빌드가 나가기 전까지 Android 는 브라우저로 열린다.

웹 「앱 열기」 버튼(`shared/lib/app-handoff/appHandoff.ts`)은 이 검증과 무관하다 — intent 에 package 를
지정해 검증 없이도 앱으로 간다.
