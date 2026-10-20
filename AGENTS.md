# Jirum-Alarm-Frontend Monorepo

## 이 레포가 푸는 문제
핫딜은 커뮤니티·쇼핑몰 수십 곳에 흩어져 있고 몇 시간이면 끝난다. 사용자가 그걸 돌아다니지 않고 한 곳에서 찾고(웹·검색 유입), 관심사를 걸어 두면 알림으로 다시 돌아오게(앱 푸시·알림함) 하는 것이 지름알림의 «사람 쪽» 절반이고, 이 레포가 사람이 닿는 화면 전부를 가진다.
수집·판정·발송은 백엔드가 하고 여기는 그 결과를 crawling-server GraphQL 하나로 읽어 보여 주고 등록받는다.
화면들이 같은 GraphQL 스키마·디자인 토큰(`packages/design-system`)·카드 규칙을 공유하고 웹 운영 태그 하나(`release-tag.py`)가 ai·beauty 배포까지 같이 데려가서 한 Turborepo 에 모았다.

- **성공의 모습**: 북극성 = 알림 경유 재방문/주, 보조 = 검색 유입 활성·포획률(그로스 트리 대시보드, vault `domain/growth-targets.md`). 배포는 `RELEASE-TAG DONE` + gitops `deploy-verify.py` PASS, 앱 JS 는 `mobile-ota` boot-check 통과, 런타임 오류는 Sentry.
- **소유**: 아래 앱 6개의 화면·Next API 라우트(`/api/graphql` 프록시 등), 스토어 바이너리·OTA, 업데이트 안내 `apps/web/public/app-release.json`, 디자인 토큰.
- **안 하는 것**: 수집·매칭·가격 판정·알림 발송·GraphQL 스키마 = crawling-server(+matching-api·metadata-api·publisher). 카톡방 봇 = kakaotalk-bot. 단축 URL = shortner-server. 운영자 어드민 = jirum-alarm-admin. 옛 AI 채팅 백엔드 = jirum-alarm-chat. 운영 링크 모음 = jirum-alarm-dashboard. 배포 매니페스트 = jirum-alarm-gitops `apps/frontend-*`.
- **위아래**: crawling-server GraphQL(검색도 그 뒤 Meili) → 이 레포 → 검색·카톡방·푸시로 들어온 사용자.
- **더 읽을 것**: vault `domain/service-blueprint.md` · `runbook/frontend-deploy-and-api-routing.md` · `runbook/mobile-*.md` · 각 `apps/*/AGENTS.md`.

앱별로 푸는 문제:
- `web`(jirum-alarm.com) — 검색 유입의 입구. 핫딜 목록·상세(「왜 핫딜인지」 근거)·키워드 알림 등록. 앱 안 웹뷰 화면(글쓰기·약관 등)도 여기서 나간다.
- `mobile`(Expo, iOS·Android) — 알림을 받는 개인 우편함. 푸시를 실제로 받는 사람 대부분이 앱 사용자라 마이페이지·키워드·설정·상세는 네이티브 화면이다.
- `landing`(about-us 소개 페이지, Cloudflare Pages) — 처음 온 사람에게 서비스를 보여 주고 스토어·카톡방으로 보낸다. gitops 밖이라 실패는 `landing-build` CI 로만 보인다.
- `ai`(ai.jirum-alarm.com, 허용 유저만) — 「언제 사나」 프로토타입: 상품 한 줄 → 90일 핫딜로 본 좋은 가격·지금 살지. 옛 시세 채팅 `/c/*` 와 홈 잠금(`/api/quota`)은 아직 jirum-alarm-chat 에 붙어 있다.
- `beauty-web`(jirum-alarm.com/beauty) — 화장품만 보는 별도 서비스. basePath `/beauty` 가 gitops 라우팅과의 계약이고 그 밖 경로는 web 이 받는다.
- `design`(design.jirum-alarm.com) — 디자인 시스템 놀이터(Storybook)·스토리 자동 검증. 사용자 기능 없음.

**사용자 화면 기능은 `apps/web` 과 `apps/mobile` 을 같이 바꾼다.** 앱 화면 대부분이 웹뷰가 아니라 네이티브라 웹만 고치면 앱 사용자에게 안 보인다. 한쪽만 했으면 완료 보고에 「앱 미반영」을 적는다.

**Korean Hot Deal Aggregation Service** - 모든 핫딜을 한번에

A comprehensive monorepo for the Jirum-Alarm service, which aggregates hot deals from various Korean communities. Built with Next.js, TypeScript, and modern web technologies.

## 🏗️ Monorepo Overview

This is a **Turborepo monorepo** that manages multiple applications and shared packages for the Jirum-Alarm platform. The service aggregates hot deals from various Korean communities and provides them through web and mobile applications.

### Key Features
- **Multi-app Architecture**: Separate apps for web, mobile, and landing pages
- **Design System**: 색·글자·모서리·그림자 토큰 한 곳(`packages/design-system`) — 웹·앱·소개·AI 가 같은 값을 읽고, 린트가 우회를 막는다
- **Hot Deal Aggregation**: Real-time deal collection from various Korean communities
- **Category-based Organization**: Deals organized by categories
- **Custom Notifications**: Alert system for desired products
- **Analytics Dashboard**: Admin panel for monitoring and management

## 📁 Repository Structure

```
jirum-alarm-frontend/
├── apps/                    # Next.js applications + RN app
│   ├── mobile/             # Expo bare React Native app (iOS·Android)
│   ├── web/                # Main web application (port 3000)
│   ├── landing/            # Landing page (port 3100)
│   ├── beauty-web/         # 지름알림 뷰티 — jirum-alarm.com/beauty (basePath, port 3300)
│   └── design/             # 디자인 시스템 놀이터(Storybook, port 6006) — 부품 만지기·자동 검증
├── packages/               # Shared packages
│   ├── eslint/            # ESLint configuration
│   ├── prettier/          # Prettier configuration  
│   ├── typescript/        # TypeScript configuration
│   ├── graphql-schema/    # 운영 GraphQL 스키마 한 벌(web·mobile codegen 공용)
│   └── design-system/     # 토큰·레시피·조립 규칙·부품 카탈로그·린트(README 필독)
├── turbo.json            # Turborepo configuration
├── pnpm-workspace.yaml   # PNPM workspace configuration
└── package.json          # Root package configuration
```

## ⚙️ Key Configuration Files

### Root Configuration
- **`package.json`**: Root package with Turborepo scripts and dependencies
- **`turbo.json`**: Turborepo task orchestration and caching
- **`pnpm-workspace.yaml`**: PNPM workspace configuration
- **`knip.json`**: Knip configuration for unused code detection

### Development Environment
- **Node.js**: `>=v20.x.x` required
- **Package Manager**: `pnpm@10.30+`
- **TypeScript**: `^6.0.3`
- **Turbo**: `^2.11` for monorepo orchestration

## 🚀 Applications

### 1. **Web App** (`apps/web/`)
**Main Application - Hot Deal Aggregation Platform**

**Technology Stack:**
- **Framework**: Next.js 16.4 with App Router
- **UI**: React 19.3, Tailwind CSS 4.3
- **State Management**: Jotai, React Query (TanStack Query)
- **Data Fetching**: React Query + GraphQL codegen 문서(`src/shared/api/**/*.service.ts` → `shared/api/gql`, `shared/lib/http-client` 의 `execute`). Apollo 는 쓰지 않는다
- **Styling**: Tailwind CSS, Tailwind Merge, Class Variance Authority
- **Animation**: Motion, Swiper, Tailwind CSS Animate
- **Analytics**: GA4(웹=GTM dataLayer, 앱=Firebase), Clarity(웹), Sentry. Mixpanel 은 코드가 아니라 GTM 태그
- **Real-time**: GraphQL WS, Firebase
- **Development**: Storybook, MSW for mocking

**Key Features:**
- Hot deal aggregation from multiple Korean communities
- Category-based browsing and filtering
- Real-time notifications and alerts
- Mobile-responsive design
- Web app manifest only — no offline service worker (the only SW is `firebase-messaging-sw.js` for push)
- Comprehensive analytics integration

**Development Scripts:**
```bash
pnpm dev              # Development server
pnpm dev:mock         # Development with MSW mocking
pnpm build           # Production build
pnpm --filter design storybook   # 컴포넌트 놀이터(apps/design 이 web 스토리를 모아 보여 준다)
pnpm code-gen        # GraphQL code generation (스키마 = packages/graphql-schema)
```

**운영 배포 = `python3 scripts/release-tag.py`** (손으로 `git tag` 하지 않는다). main 포함 확인 → 직전 태그 이후 포함분·같이 나갈 ai/beauty 배포 →
feat=minor/그 외 patch → 스테이징 빌드 성공 증거 → 웹 GraphQL 문서를 **운영 스키마**로 검증(서버 롤아웃 전 태그 차단) →
원격 기준 번호로 annotated 태그(경합 시 재계산) → deploy-web-prod 결과 → gitops `scripts/deploy-verify.py frontend-web` →
봇 UA(구글·네이버)로 운영 HTML 점검(`scripts/seo-check.py` — noindex·h1·canonical·JSON-LD·본문, 같은 점검이 `seo-check.yml` 로 매일) 까지 한 번에.
`--dry-run` 은 관문까지만. 성공 출력 `RELEASE-TAG DONE vX.Y.Z` 가 «운영 배포됨» 보고의 근거다.

### 2. **Admin** — 이 레포에 없다
어드민(admin.jirum-alarm.com)은 2026-10-20 **jirum-alarm-admin** 레포로 옮겼다. 어드민 화면·배포·규칙은 그 레포 AGENTS.md.

### 3. **Landing App** (`apps/landing/`)
**Marketing Landing Page**

**Technology Stack:**
- **Framework**: Next.js 16.4
- **UI**: React 19.3, Tailwind CSS 4.3
- **Styling**: Motion for animations, Tailwind Merge

**Key Features:**
- Marketing and promotional content
- Feature showcases
- App download links and integration
- SEO-optimized structure

**Development Scripts:**
```bash
pnpm dev --port 3100  # Development server on port 3100
pnpm build            # Production build
```

### 4. **Mobile App** (`apps/mobile/`) — 배포 규칙
**Expo bare RN 앱.** 배포는 두 길이고, 어느 길인지는 사람이 아니라 **네이티브 지문**이 정한다.

- **JS 변경 = 기동 확인 뒤 OTA.** 테스트·타입·린트·지문이 초록이어도 **실제로 켜 보기 전엔 내지 않는다.**
  2026-10-01 사고: `5cd32399` 로 낸 OTA 가 실행 즉시 종료 → 직전 그룹 재발행으로 롤백. CI 는 전부 초록이었고,
  그 OTA 엔 그동안 안 나간 다른 작업 커밋 7개(시작 경로 변경 포함)가 함께 실려 있었다.
  원인은 미확정 — 같은 그룹을 다시 냈을 때 실기기(iPhone·로그인·다크모드) 콜드 스타트 정상, 크래시 로그(.ips)·JS 예외 없음,
  시뮬레이터(Hermes 바이트코드·다크모드·토큰)도 정상. 연달아 낸 OTA 4개를 받고 적용하던 중의 1회성으로 본다. 앱 Sentry 가 꺼져 있어 확정 불가.
  1. **발행 범위부터 본다.** `eas update:list --branch production --limit 1` 의 마지막 발행 이후
     `git log <그 커밋>..HEAD -- apps/mobile`. 내 커밋이 아닌 미발행 커밋이 섞였으면 작성자(다른 세션)에게 알리고 같이 확인한다.
  2. **발행할 커밋 그대로 iOS 시뮬레이터 Release 빌드 → 콜드 스타트 2회 + 홈·바뀐 화면 진입.**
     "켜지나" 판정은 `bash apps/mobile/scripts/boot-check.sh <Release .app>` 한 줄로 된다(이 커밋 JS 를 끼워 콜드 스타트 3회 —
     생존·치명 JS 예외 없음·JS 실행 흔적(AsyncStorage deviceId)을 본다. 자동 OTA 의 CI 관문과 같은 스크립트.
     Release 앱은 JS 치명 오류에도 안 죽고 멈추기만 해서 "살아 있나" 만으론 못 잡는다 — 10/9 뮤테이션 실측)
     안드로이드는 `bash apps/mobile/scripts/boot-check-android.sh <Release .apk>`(에뮬레이터 필요, 콜드 스타트 2회 —
     생존·logcat 치명 예외·첫 화면 글자(uiautomator)). APK 는 `./gradlew assembleRelease -PreactNativeArchitectures=<에뮬 ABI>`
     + `-Pandroid.injected.signing.*`(임시 키 — 로컬 keystore.properties 가 없는 업로드 키를 가리키면 그냥은 실패한다). JDK 17+.. 바뀐 화면 진입은 여전히 손으로 본다.
     `cd apps/mobile/ios && rm -f Pods/.last_build_configuration && pod install && rm -f Pods/.last_build_configuration &&
     xcodebuild -workspace jirumAlarmMobile.xcworkspace -scheme jirumAlarmMobile -configuration Release -sdk iphonesimulator
     -destination 'generic/platform=iOS Simulator' -derivedDataPath build CODE_SIGNING_ALLOWED=NO build`
     → 시뮬레이터 부팅(`xcrun simctl list devices available` 에서 최신 OS 기기) → `xcrun simctl install booted build/Build/Products/Release-iphonesimulator/jirumAlarmMobile.app` → `xcrun simctl launch booted com.jirum-alarm.jirumalarm`.
     (Firebase plist 는 git 에 없다 — 로컬 사본을 `ios/GoogleService-Info.plist` 에. 안드로이드 전용 코드가 바뀌었으면 에뮬레이터 release 도.)
     - 함정: `Pods/.last_build_configuration` 이 남아 있으면 Debug Hermes 가 링크돼 `initializeRuntime` SIGSEGV(debugJavaScript 스택)로
       죽는다 — 가짜 재현이다. 크래시 리포트는 `/bin/ls -lt ~/Library/Logs/DiagnosticReports`(별칭 ls 는 정렬이 틀린다).
     - **JS 만 바뀌었으면 빌드 없이 더 빠르게**(실측 2026-10-01): 아무 Release `.app`(예: `xcrun simctl get_app_container <기기> com.jirum-alarm.jirumalarm`)을
       복사해 `main.jsbundle` 만 바꿔 끼운다 — `cd apps/mobile && npx expo export --platform ios --output-dir <out>`(OTA 와 같은 Hermes 바이트코드)의
       `_expo/static/js/ios/*.hbc` → `<app>/main.jsbundle`, `codesign --force --deep --sign - <app>`, **전용 시뮬레이터**(`xcrun simctl create`)에
       uninstall → install → launch. 첫 실행은 내장 번들로 뜬다(그 사이 production OTA 를 받아 두 번째부터 덮으므로 판정은 매번 재설치 후 첫 실행).
       ⚠️ 판정용 시뮬레이터는 **새로 만든 깨끗한 기기**로. 옛 OTA(앱 시작 때 권한을 묻던 코드)를 한 번이라도 띄운 기기는
       재설치해도 OS 알림 권한 팝업이 계속 떠서(JS 를 비운 번들로도 뜸) "권한을 앱 시작 때 묻는다" 로 오판한다(10/1 실측).
       ⚠️ 단 `simctl create` 로 막 만든 iOS 27 기기는 **원본 번들로도 스플래시에서 영영 멈춘다**(10/5 실측) — 메인 스레드가
       Firebase Messaging 의 `isRegisteredForRemoteNotifications` XPC 응답을 기다린다(`sample <pid>` 로 확인, 크래시·JS 로그 0).
       그러면 앱을 이미 띄워 본 기존 기기를 쓰고(권한 판정만 새 기기), 재시작까지 볼 거면 사본 `.app` 의 `Expo.plist` 에서
       `EXUpdatesEnabled` 를 false 로 바꿔 재서명한다 — 안 그러면 두 번째 실행부터 production OTA 가 내 번들을 덮는다.
       로그인 경로는 설치 직후 `<data>/Library/Application Support/com.jirum-alarm.jirumalarm/RCTAsyncLocalStorage_V1/manifest.json` 에
       `{"refreshToken":"\"x\""}` 를 넣으면 즉시 진입·메인 마운트까지 탄다(서버 거절 → 로그인). 다크모드는 `xcrun simctl ui <기기> appearance dark`.
  3. 통과한 커밋으로 `pnpm ota:publish "메시지"`(지문 확인 → 발행 → Sentry 소스맵 업로드까지 한 번에; 토큰은 EAS production env `SENTRY_AUTH_TOKEN`, sensitive) → 매니페스트를 채널 헤더로 curl 해 새 update id 확인 → 내 기기에서 **두 번** 켜 본다
     (OTA 는 두 번째 실행에 적용된다).
  4. 이상하면 즉시 되돌린다. `pnpm ota:rollback` 은 대화형이라 에이전트가 못 쓴다 →
     `eas update:list --branch production --json` 에서 직전 정상 group 을 찾아
     `eas update:republish --group <id> --non-interactive --message "ROLLBACK: …"`(같은 브랜치로 재발행 — `--group` 과 `--branch` 는 함께 못 쓴다).
  - **자동 OTA(`mobile-ota`, `MOBILE_AUTO_OTA=true`, 2026-10-09 켬)**: main push → mobile-validation 성공 →
    `boot-check`(iOS, macOS)·`boot-check-android`(에뮬레이터) 잡 통과(Release 앱·APK 는 네이티브 지문으로 캐시) → production 발행 → Mattermost `alert-deploy`.
    그래서 JS 는 **main 에 푸시하면 나간다** — 위 1~3번을 손으로 할 일은 없고, 푸시 뒤 `gh run watch` 로 mobile-ota 결과를 확인한다.
    기동 확인은 "켜지다 죽거나 JS 가 못 도는 것" 만 잡는다(오류 없는 화면 깨짐은 못 봄) — 바뀐 화면이 큰 변경이면 푸시 전에 로컬에서 띄워 본다.
    기동 확인은 회차마다 녹화·스크린샷을 아티팩트 `boot-evidence-ios`·`boot-evidence-android`(7일)로 남긴다 — 실패 원인이나 첫 화면이 맞는지는 `gh run download <run> -n boot-evidence-<ios|android>` 로 화면을 본다(로컬 실행은 `BOOT_EVIDENCE=<dir>`).
    사고 때 첫 조치: 저장소 변수 `MOBILE_AUTO_OTA` 를 끄고(`gh variable set MOBILE_AUTO_OTA -b false`) 4번으로 롤백.
- **네이티브 변경 = 버전 올림 + 스토어 빌드.** `ios/`·`android/`·네이티브 패키지(예: expo-image)·`app.json`
  플러그인이 바뀌면 **같은 커밋에서** 버전·runtimeVersion 을 올리고(app.json·Expo.plist·strings.xml 등 —
  `ota-updates-config` 테스트가 정렬을 본다) `pnpm --filter mobile native:write` 로 지문 기준을 새로 찍는다.
  안 하면 CI `native:check` 가 막는다(그대로 OTA 가 나가면 옛 바이너리가 실행 즉시 죽는다). 그다음 스토어 빌드·제출.
  - 버전을 올린 뒤 OTA 는 새 runtime 바이너리에만 간다 — 옛 버전용 OTA·hotfix 브랜치는 기본으로 만들지 않는다(하위호환 안 챙김).
    **요청이 있으면 옛 runtime 에도 백포트한다**(2026-10-09 1.4.7·1.4.6 실적): main 을 그대로 보내지 말고(그 사이 네이티브가 바뀌어 죽는다)
    `eas update:view <그 runtime 의 마지막 group> --json` 의 `gitCommitHash` 에 워크트리 → 변경 cherry-pick → 그 커밋 lockfile 로
    `pnpm install --frozen-lockfile` → tsc·`native:check`·jest → **그 커밋으로 Release 시뮬 빌드** 콜드 스타트 2회 → `pnpm ota:publish`(origin 에 `ota/runtime-<runtime>` 이 있으면 브랜치를 먼저 push 해 끝을 차지하고, 거절·원격이 앞섬·미커밋 변경이면 발행하지 않는다 — 10/12 다른 세션 발행을 두 번 덮은 뒤 넣음).
    로컬 빌드 함정: Xcode 27 은 `IPHONEOS_DEPLOYMENT_TARGET=15.1` 을 넘겨야 옛 Pod 이 빌드되고, `/tmp` 아래 워크트리는 번들 단계가
    경로를 못 찾아 `SKIP_BUNDLING=1` + 위 "번들만 바꿔 끼우기"로 간다. `pod install` 이 바꾼 `Podfile.lock`·`project.pbxproj` 는
    발행 전 커밋본으로 되돌린다(안 하면 `native:check` 가 막는다). 마지막 OTA 커밋이 이미 다음 runtime 으로 올린 커밋이면 재현 불가 — 건너뛴다.
    **`ota/runtime-<버전>` 브랜치가 이미 있으면 한 줄로**: `bash apps/mobile/scripts/ota-backport.sh --runtime <버전> --app <그 버전 Release .app> <커밋…>`
    (브랜치 끝 워크트리 → cherry-pick → 설치·tsc·지문·jest(CI 조건) → 기동 확인 → 원격 끝 재확인 → `ota:publish` → push → 매니페스트 확인. `--dry-run` 은 발행 직전까지).
    JS 수정은 스토어에 나가 있는 runtime **전부**(10/17 기준 1.5.5·1.5.4(Android 만 — iOS 는 1.5.4 바이너리가 없다)·1.5.3·1.5.2·1.5.1·1.5.0·1.4.8·1.4.7 — main 은 1.5.6. `ota/runtime-1.5.5` = 0f22db4a(1.5.5 마지막 자동 OTA), `ota/runtime-1.5.4` = 4f614dac)에 따로 낸다 — `--runtime all` 이 origin 의 `ota/runtime-*` 전부를 돈다.
    **어느 runtime 까지?** 지난 7일 앱 활성 사용자(GA4 `appVersion` — 바이너리 버전이라 OTA 와 무관)의 **10% 이상**이면 낸다, 그 아래로 떨어지면 끊는다.
    (2026-10-13 판정: 1.4.7·1.4.8·1.5.0 셋 다 기준 이상 — 버전별 수치는 vault.)
    `ota/runtime-1.5.3` 은 1.5.3 마지막 자동 OTA 커밋(57a5ca0f)에서 시작(10/16 Android 앱 링크 경로로 1.5.4 를 올리기 직전). `ota/runtime-1.5.1` 은 1.5.1 마지막 자동 OTA 커밋(620b2b75)에서 시작(10/13 1.5.2 를 main 에 합치기 직전). `ota/runtime-1.4.7` 은 1.4.8 브랜치 JS 를 runtime 1.4.7 로 낸 것(10/13) — 기동 확인 .app 은 EAS 1.4.7 sim-check 빌드
    (`eas build:list` 의 a7a48ab7 artifacts), 안드로이드는 스토어 AAB → `bundletool build-apks --mode=universal`.
  - 네이티브 변경은 몇 주에 한 번 묶어 낸다(스토어 업데이트를 사용자가 마주치는 횟수를 줄인다).
- **업데이트 안내 = `apps/web/public/app-release.json`**(웹 운영 배포로 발효, 플랫폼별 값).
  - `latestVersion`(권유): 새 스토어 버전이 **출시된 뒤** 그 플랫폼만 올린다 → 버전당 한 번 "새 버전이 나왔어요" 시트.
  - `minSupportedVersion`(강제): **옛 버전이 실제로 깨질 때만**(API 변경·보안). 평소엔 올리지 않는다 — 막는 화면은 나쁜 경험.
- 완료 보고는 길을 나눠 적는다: JS 는 「OTA 발행됨(mobile-ota run 링크 — boot-check 통과)/대기」, 네이티브는 「다음 스토어 빌드(1.x.y)에 포함」.
- "배포됐나"는 스토어 실물 버전으로 판정한다(`app-store-lag` 워크플로) — EAS submit 성공 ≠ 출시.
- **다크모드 = OS 설정을 따른다(2026-10-01). 내정보 > 화면 모드에서 라이트/다크 고정 가능(`color-scheme-preference.ts` → `Appearance.setColorScheme`).** 색 정본은 `packages/design-system/tokens.js` 한 곳(web 과 같은 값) — tailwind 토큰이 `:root` 변수라
  `bg-white`·`text-gray-900` 은 **다크에서 값만 뒤집힌다**(`dark:` 를 붙일 일이 거의 없다. `white`=바탕, gray 50↔900).
  - 테마와 무관해야 하는 자리(홈 상단 어두운 띠·사진 위 배지·색 배지 위 흰 글자·라임 버튼 위 짙은 글자)는 `fixed-*`(`text-fixed-white`, `bg-fixed-900`).
  - className 이 안 닿는 색(아이콘 color·placeholderTextColor·RefreshControl·StyleSheet)은 hex 대신 `useColors()`, 헤더·탭바는 `useChromeColors()`.
  - 웹뷰 화면(글쓰기·약관·고객센터·공용 웹뷰)도 같은 모드다 — 앱이 지금 모드를 웹뷰 쿠키 `COLOR_SCHEME` 에 적고(`shared/theme/webview-color-scheme-cookie.ts`) web 서버가 그 값으로 `<html class="dark">` 를 그린다(2026-10-10). 이미 열린 웹뷰는 다시 열어야 바뀐다. 웹뷰 틀(상태바 영역·안전 영역)에 흰색을 박지 말 것. 네이티브 탭바 PNG 는 `*-dark` 변형이 따로 있다(`assets/tab-icons/README.md`).

### 5. **Beauty Web** (`apps/beauty-web/`) — 지름알림 뷰티
화장품(categoryId 3)만 보이는 별도 Next 앱. 도메인은 그대로 `jirum-alarm.com/beauty/*`(검색 색인 승계) — 게이트웨이가 `/beauty` 접두만 이 파드로 보낸다.
- **basePath `/beauty` 는 gitops 라우팅과의 계약**(정적 자산도 `/beauty/_next/…`). 컨테이너 포트 3000.
- basePath 밖(`/products/{id}`·`/search`·`/login`·`/api/graphql`·`/_next/image`)은 본 서비스(web) 파드가 받는다 → 그쪽 링크는 next/link 가 아니라 일반 `<a>`(`ServiceLink`).
  브라우저 GraphQL·사진 최적화도 web 의 루트 `/api/graphql`·`/_next/image` 를 같이 쓴다(로컬 단독 실행은 next.config.ts rewrites 가 운영으로 넘긴다 — 읽기만, 쓰기는 `service-host.ts` 가 막는다).
  `next.config.ts` 의 이미지 크기 목록은 web 과 같아야 한다.
- 런타임 env 는 서버에서 next-runtime-env `env()` 로 읽는다(`NEXT_PUBLIC_*` 를 process.env 로 직접 읽으면 빌드 값이 박힌다): `API_URL`·`NEXT_PUBLIC_SERVICE_URL`·`NEXT_PUBLIC_KAKAO_BEAUTY_ROOM_URL`(비면 카톡방 안내 숨김).
- 계측은 web 과 같은 GTM 컨테이너·같은 data-* 카드 속성. 노출 출처 `beauty_home`·`beauty_ranking`, 카드에 `data-service="beauty"`, dataLayer `service`·`content_group`=beauty.
- web 에서 옮긴 조각(카드 표기·okachat·노출 추적·로고·아이콘)은 파일 머리 주석에 원본 경로가 있다 — web 쪽 규칙을 바꾸면 같이 바꾼다.
- 배포: main push → `deploy-beauty-web-staging`, `v*.*.*` 태그 → `deploy-beauty-web-prod`(이미지 `jirum-alarm-frontend-beauty-web`, gitops `apps/frontend-beauty-web/overlays/*`).

```bash
pnpm --filter beauty-web dev     # http://localhost:3300/beauty (운영 공개 API 를 읽는다)
pnpm --filter beauty-web build && pnpm --filter beauty-web test
```

## 📦 Shared Packages

### 1. **ESLint Config** (`packages/eslint/`)
**`@jirum/eslint-config-jirum`**

Comprehensive ESLint configuration for all applications:
- Next.js plugin support
- TypeScript integration
- React and React Hooks rules
- Prettier compatibility
- Storybook linting
- Import/export rules
- Turbo config support

### 2. **TypeScript Config** (`packages/typescript/`)
**`@jirum/tsconfig`**

Shared TypeScript configuration:
- Base TypeScript settings
- Path mapping configurations
- Compiler options optimized for Next.js
- Public access configuration

### 3. **Prettier Config** (`packages/prettier/`)
**`@jirum/prettier`**

Code formatting standards:
- Consistent code style across all packages
- Tailwind CSS class sorting
- JSON and markdown formatting

### 4. **Design System** (`packages/design-system/`)
**`@jirum/design-system`** — 쓰는 법·색의 의미·예외는 [README](packages/design-system/README.md)

- `tokens.js` 가 색(라이트·다크·fixed·브랜드)·사이 글자 크기·모서리·그림자·차트 색의 **유일한 원본**. web·landing·ai·beauty-web·design 은 생성된 `theme.css` 를 `@import`, 앱은 `tailwind.config.js` 가 require.
- 토큰을 고치면 `pnpm --filter @jirum/design-system build` 로 theme.css 를 다시 만들어 같이 커밋(커밋 훅이 확인).
- `eslint.js` 가 web·앱·landing·ai·beauty-web·design 에서 hex·Tailwind 기본 팔레트·`text-black`·임의 글자 크기·모서리·그림자·눈금에 이름이 있는 임의 간격(`w-[48px]`)·홀수 px 여백·효과 없는 클래스(`text-semibold`)를 막는다.
- 컴포넌트 코드는 플랫폼별(web DOM / 앱 RN)이지만 **모양은 `recipes.js` 한 곳** — 두 플랫폼이 같은 클래스 문자열을 읽는다. 배지·칩·탭·스위치·섹션 제목·시트 가림막·`animate-pulse` 판·헤더·목록 행·카드 글자를 손으로 다시 만들지 말 것(테스트가 막는다). 글자는 `text` 역할(display·title·subtitle·label·body·muted·caption)부터. 어드민은 범위 밖(TailAdmin).
- **조립 규칙 `layout.js`**: 화면 좌우 여백(`gutter` px-5)·섹션 간격·묶음 간격(`stack`)·조작 높이(`control`)·아이콘 크기(`icon`)는 여기 이름으로. 차트 색은 tokens 의 `chart` 역할(`chartVar`·`chartColor`).
- **부품 카탈로그 `catalog.js`** = 부품 목록의 정본(README·여기엔 목록을 다시 적지 않는다): 새 화면은 여기(놀이터 「부품 지도」)서 조각을 고른다. 공용 폴더(web `shared/ui`·앱 `shared/components`)에 부품을 만들면 한 줄 등록 + web 부품 옆 스토리, 올리지 않을 거면 `catalog.test.mjs` 의 `NOT_PARTS` 에 이유 — 빠지면 테스트가 막는다. 고르는 규칙(칩·탭·링크 칩, 토스트·확인 창)은 README 「컴포넌트」.
- **놀이터 `apps/design`**: web 스토리(컴포넌트 옆 `*.stories.tsx`)를 모아 보여 주고, `test:stories` 가 모든 스토리를 라이트·다크로 렌더 + play(조작) + axe 접근성으로 검사한다(CI `design-system.yml`, main 푸시면 배포). 앱 RN 부품은 앱 숨은 화면 「디자인 시스템」(딥링크 `design-system`).

## 🛠️ Development Guidelines for AI Agents

### Code Quality Standards
1. **TypeScript**: All code must be fully typed
2. **ESLint**: Follow `@jirum/eslint-config-jirum` rules
3. **Prettier**: Use `@jirum/prettier` for consistent formatting
4. **Design System**: 색·글자 크기·모서리·그림자는 토큰만 쓴다(`bg-[#…]`·`text-[13px]`·`text-emerald-700` 금지 — 린트가 막는다). 의미별 색은 `packages/design-system/README.md`
5. **디자인 시스템이 정본 — 틀렸으면 거기부터 고친다**(2026-10-20). 화면 모양(색·간격·글자·부품 모양)이 이상하면 화면에서 값을 손으로 맞추기 전에
   원인이 `packages/design-system`(tokens·recipes·layout·catalog 부품)에 있는지 먼저 본다. 정본이 틀렸거나 비었으면 **정본을 먼저 고치고**(web·앱이 함께 바뀐다),
   화면은 정본을 쓰도록만 고친다. 화면 한 곳의 국소 보정은 같은 깨짐이 다른 화면·다른 플랫폼에 남고, 다음 사람이 정본과 화면 중 무엇이 맞는지 모르게 만든다.
   web↔앱 «같아야 하는 것»도 서로의 소스를 대조하지 말고 각자 정본(design-system·`packages/domain`)을 쓰는지로 검사한다.

### Architecture Principles
1. **Monorepo Awareness**: Changes may affect multiple applications
2. **Shared Dependencies**: Leverage workspace packages for common functionality
3. **GraphQL**: web·앱은 codegen 타입 문서 + React Query
4. **State Management**: Use Jotai for client state, React Query for server state

### Development Workflow
1. **Install Dependencies**: Always use `pnpm install` at root level
2. **Development**: Use `pnpm dev` for parallel development of all apps
3. **Type Checking**: Run `pnpm check-types` to verify all packages
4. **Linting**: Use `pnpm lint` for code quality checks
5. **Building**: Use `pnpm build` for production builds

### 검증 레시피 — 바꾼 것 → 완료 보고 전에 돌릴 것
커밋 훅(lint-staged)이 바뀐 앱의 타입·린트·node 테스트를 이미 돌린다. 그건 «로직이 맞나»까지만 본다 — 버그가 실제로 나는 층은 «그려진 화면»이라
화면을 바꿨으면 아래 화면 검증까지 하고 결과(통과 수·report 요약·본 png)를 보고에 붙인다.

| 바꾼 것 | 돌릴 것 | 무엇을 보나 |
|---|---|---|
| 순수 로직(`lib/`·`model/`·`packages/domain`) | 훅이 돌리는 테스트 + 새 동작의 테스트 | 입력→출력 |
| web 화면·컴포넌트 | `pnpm --filter web screens -g <화면>` → `apps/web/screens/.out/report.md` → 그 화면 png 를 직접 본다 | 오류·넘침·겹침·대비, 라이트·다크·모바일·PC·빈·에러 상태 |
| web 새 화면·새 쿼리 | `apps/web/screens/pages.ts` 한 줄 + `pnpm --filter web screens:record` | 위와 같음(고정 데이터로) |
| web 공용 부품(`shared/ui`) | 스토리 + `pnpm --filter design test:stories` | 라이트·다크 렌더·조작·axe |
| 디자인 시스템(tokens·recipes·layout) | `pnpm --filter @jirum/design-system test` + `test:stories` + `screens` | 정본 변경이 모든 화면에서 맞나 |
| 앱 JS 화면 | `pnpm --filter mobile exec jest <관련>` + `bash apps/mobile/scripts/screens-ios.sh <Release .app>` → `apps/mobile/screens-out/report.md`, 안드로이드는 `bash apps/mobile/scripts/screens-android.sh <Release .apk>`(google_apis 에뮬레이터 — adb root 필요) → `apps/mobile/screens-out-android/report.md` → png 를 직접 본다(새 화면은 두 스크립트 SCREENS 에 딥링크 한 줄, 판정은 공용 `screens-judge.py`). CI `mobile-ota` 의 app-screens·app-screens-android 잡·아티팩트 `app-screens-ios`·`app-screens-android` | 화면별 라이트·다크, 빈 화면·치명 예외·딥링크로 못 감 |
| 앱 네이티브 | 위 Mobile App 배포 규칙(버전·`native:write`·Release 시뮬) | |
| GraphQL 문서 | `node scripts/gql-check.mjs`(운영 스키마) — `release-tag.py` 가 태그 때도 본다 | 서버 롤아웃 전 필드 |
| 운영 반영 | `python3 scripts/release-tag.py` → `RELEASE-TAG DONE` | 배포 판정 |

CI: `web-screens`(main·PR, 운영 빌드로 같은 하네스, 아티팩트 `web-screens`) · `design-system`(스토리) · `mobile-validation`→`mobile-ota`(boot-check).

### Testing and Quality Assurance
1. **Storybook**: Components should have Storybook stories
2. **MSW**: `dev:mock` 의 손 핸들러는 일부 쿼리만 다룬다 — 화면 검증은 녹화 데이터를 쓰는 `apps/web/screens`(README)로
3. **GraphQL**: 스키마는 `packages/graphql-schema/schema.graphql` 한 벌(운영). 갱신 `GRAPHQL_INTROSPECTION_KEY=$(python3 scripts/introspection_key.py) pnpm --filter @jirum/graphql-schema refresh` → web·mobile 각각 `pnpm --filter <app> code-gen`
4. **Knip**: Use Knip to detect unused code and dependencies

### File Organization
- **Apps**: Feature-specific code in respective `apps/` directories
- **Packages**: Shared functionality in `packages/` directory
- **Configuration**: All config files use workspace references
- **Types**: Shared types should be in appropriate packages or apps

## 🔧 Technology Stack

### Core Technologies
- **Framework**: Next.js 16.4 (App Router)
- **Language**: TypeScript 6.0
- **Package Manager**: PNPM 10.30
- **Monorepo**: Turborepo 2.11
- **UI Library**: React 19.3

### Styling & UI
- **CSS Framework**: Tailwind CSS 4.x
- **Component Library**: Custom Radix UI-based components
- **Animation**: Motion, Swiper, Tailwind Animate
- **Styling Utils**: Tailwind Merge, Class Variance Authority, CLSX

### Data & State Management
- **GraphQL**: codegen(client preset) + React Query(web·앱)
- **State Management**: Jotai 3.x
- **Server State**: TanStack React Query 5.x
- **Real-time**: GraphQL WS, Firebase 13.x

### Development & Tooling
- **Code Quality**: ESLint 10.x, Prettier 3.x, Husky, Lint-staged
- **Testing**: Storybook 10.x, MSW 3.x for mocking
- **Build Tools**: Next.js Bundle Analyzer, Sharp for image optimization
- **Type Generation**: GraphQL Code Generator

### Analytics & Monitoring
- **Error Tracking**: Sentry 10.x
- **Analytics**: GA4 (GTM), Clarity — 웹 이벤트는 GTM 에 태그·트리거가 있어야 GA4 에 들어간다
- **Performance**: Web performance monitoring
- **Deployment**: Platform-agnostic deployment configuration

### External Integrations
- **Authentication**: JWT-based auth system
- **File Upload**: Express-based middleware
- **Notifications**: Firebase Cloud Messaging
- **Search**: Custom search implementation

## 🚀 Getting Started

### Prerequisites
- Node.js >= v20.x.x
- PNPM package manager

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd jirum-alarm-frontend

# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

### Development Commands
```bash
# Development (all apps)
pnpm dev

# Individual app development
pnpm --filter web dev
pnpm --filter landing dev

# Type checking
pnpm check-types

# Linting
pnpm lint

# Building
pnpm build

# 디자인 시스템 놀이터 (Storybook) — 만지기 / 스토리 전체 라이트·다크·조작·접근성 검사
pnpm --filter design storybook
pnpm --filter design test:stories
```

### Environment Setup
Each app may require specific environment variables:
- Copy `.env.example` to `.env.local` in app directories
- Configure API endpoints and service credentials
- Enable/disable MSW mocking as needed

## 📝 Notes

### Performance Considerations
- Use Turborepo caching for efficient builds
- Leverage Next.js Image optimization with Sharp
- Implement proper code splitting and lazy loading
- Use React Query for efficient data fetching

### Security
- All apps use JWT-based authentication
- GraphQL schemas are typed and validated
- Environment variables are properly managed
- Content Security Policy headers implemented

### Deployment
- Deployment configuration managed per platform/environment
- Separate environments for development and production
- Automated CI/CD through repository-integrated workflows

---

**AI Agent Guidelines**: Always work within the monorepo structure, respect shared dependencies, and maintain consistency across all applications. Use workspace references for shared packages and follow the established patterns for each application type.