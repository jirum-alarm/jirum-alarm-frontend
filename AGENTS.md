# Jirum-Alarm-Frontend Monorepo

**Korean Hot Deal Aggregation Service** - 모든 핫딜을 한번에

A comprehensive monorepo for the Jirum-Alarm service, which aggregates hot deals from various Korean communities. Built with Next.js, TypeScript, and modern web technologies.

## 🏗️ Monorepo Overview

This is a **Turborepo monorepo** that manages multiple applications and shared packages for the Jirum-Alarm platform. The service aggregates hot deals from various Korean communities and provides them through web and mobile applications.

### Key Features
- **Multi-app Architecture**: Separate apps for web, admin, and landing pages
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
│   ├── admin/              # Admin dashboard (port 3000, 운영 도구)
│   └── landing/            # Landing page (port 3100)
├── packages/               # Shared packages
│   ├── eslint/            # ESLint configuration
│   ├── prettier/          # Prettier configuration  
│   ├── typescript/        # TypeScript configuration
│   └── design-system/     # 디자인 토큰 원본·린트 규칙·문서(README 필독)
├── configs/               # Build and deployment configs
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
- **Package Manager**: `pnpm@10.15.0+`
- **TypeScript**: `^5.8.3`
- **Turbo**: `^2.0.1` for monorepo orchestration

## 🚀 Applications

### 1. **Web App** (`apps/web/`)
**Main Application - Hot Deal Aggregation Platform**

**Technology Stack:**
- **Framework**: Next.js 15.4.10 with App Router
- **UI**: React 19.1.2, Tailwind CSS 4.1.11
- **State Management**: Jotai, React Query (TanStack Query)
- **Data Fetching**: Apollo Client (GraphQL)
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
pnpm storybook       # Storybook development
pnpm code-gen        # GraphQL code generation
```

### 2. **Admin App** (`apps/admin/`)
**Administrative Dashboard** — 매칭 검수·핫딜 키워드·키워드맵·광고·알림·통계·수익링크 운영 도구

**Technology Stack:**
- **Framework**: Next.js 16 (App Router), React 19.3
- **UI**: Tailwind CSS 4 (TailAdmin 토큰은 `src/css/style.css` 의 @theme: `primary`·`success`·`danger`·`stroke`·`boxdark`…). 라이트 전용 — `dark:` 클래스는 남아 있지만 토글이 없다
- **Data Fetching**: Apollo Client 4 + @apollo/client-integration-nextjs (GraphQL, 운영 API `jirum-api.kyojs.com/graphql`)
- **Charts**: ApexCharts · **Virtualization**: TanStack React Virtual · **Date**: Day.js

**Structure:**
```
src/app/
├── (admin)/            # 로그인 뒤 화면 전부 — layout.tsx 가 DefaultLayout(사이드바·헤더·에러 배너)을 한 번 그린다
│   └── <route>/        # page.tsx 는 얇게, 로직은 같은 폴더 components/ (필요시 hooks/ lib/)
├── auth/signin/        # 레이아웃 밖
├── actions/token.ts    # httpOnly accessToken 쿠키(서버 액션)
└── error.tsx           # 렌더 중 에러 경계
src/graphql/*.ts        # gql 문서(오퍼레이션) 전부 여기
src/hooks/graphql/*.ts  # 오퍼레이션별 훅 — 타입은 src/generated/gql 생성 타입(손타입 금지)
src/components/         # 공통: Layouts·Sidebar(메뉴는 MENU 설정 배열)·QueryErrorBanner·…
```

**Conventions / 함정:**
- 새 오퍼레이션: `src/graphql/`에 문서 → `pnpm --filter admin code-gen`(운영 스키마 기준) → 훅에서 생성 타입 사용.
  dev API 는 스키마가 뒤처져 codegen 소스로 쓰지 않는다.
- GraphQL 실패는 Apollo 에러 링크가 상단 `QueryErrorBanner` 로 띄운다 — 화면이 `error` 를 안 읽어도 "결과 없음"으로 위장되지 않게.
  인증 에러(FORBIDDEN/UNAUTHENTICATED)만 로그인으로 보낸다.
- searchAfter 커서 무한 스크롤은 `useLoadMoreOnView`.
- 공통 UI: 알림은 `useToast()`(alert 금지), 확인은 `await useConfirm()(...)`(confirm 금지), 로딩은 `<Spinner>`, 흰 카드 틀은 `<Panel>`.
- 모바일 우선(운영자가 주로 폰으로 본다, 390px 기준). 대시보드는 새로 짜지 말고 공통 부품부터:
  차트 `<Chart>`(ApexCharts 기본값 — 툴바·회전 없음, 축 「1.2만」), 순위·비중은 가로 막대 차트 대신 `<RankList>`,
  기간·보기 전환 `<SegmentedControl>`, 화면 안 탭 `<Tabs>`, 숫자 요약 `<StatTiles>`, 상태 `<StatusDot>`.
  영문 코드(provider·gender·광고 위치 등)는 `src/lib/labels.ts` 에서 한글 이름·출처 색을, 금액·날짜는 `src/lib/format.ts`.
  표는 `table-cards` 로 폰에서 카드가 되고, 부가 열은 `hidden md:table-cell` 로 숨기고 첫 칸에 요약 한 줄을 넣는다.
  토스트·확인 provider 는 DefaultLayout 에 한 번 달려 있다(로그인 화면은 레이아웃 밖이라 별도).
- Apollo 클라이언트는 서버 렌더에도 만들어지지만 서버엔 토큰을 싣지 않는다(httpOnly 토큰이 HTML 에 실리지 않게) —
  서버에서 인증 쿼리가 필요한 useSuspenseQuery 화면은 브라우저가 다시 받는다.
- 큰 화면(매칭 검수 `VerificationGroupByView/`, 광고 `GraphicLayerEditor/`)은 폴더 안 훅·컴포넌트로 나뉘어 있다. `layout.ts` 같은
  Next 예약 파일명은 라우트 폴더 밑에 두지 말 것(빌드가 라우트 레이아웃으로 읽는다).
- 미들웨어는 쿠키 "존재"만 본다 — 서버 액션처럼 백엔드를 안 거치는 쓰기를 만들면 액션 안에서 `adminMe` 로 어드민인지 직접 확인할 것.
- 사이드바 메뉴 추가 = `src/components/Sidebar/index.tsx` 의 `MENU` 배열에 한 줄.
- 서비스 점검(`/health`, admin 역할 전용) = 「깨지면 볼 것·고칠 것」 점검표. 내용은 `src/app/(admin)/health/lib/checks.ts` 한 곳 —
  새 수익원·크롤러·세션을 붙이거나 사고를 겪으면 거기 한 칸 추가/갱신. 레포가 공개라 내부 IP·명령은 적지 말고 vault 런북 경로로.
- `public/` 은 비어 있어도 지우지 말 것(`.gitkeep`) — Dockerfile 이 COPY 한다.

**Development Scripts:**
```bash
pnpm --filter admin dev        # :3000 (운영 API 에 붙는다 — 쓰기 조작 주의)
pnpm --filter admin build
pnpm --filter admin code-gen   # 운영 스키마로 타입 생성
```

**Deploy:** main push → 스테이징. 운영은 `v*.*.*` 태그(web·ai 도 함께 나감) 또는 admin 만: `gh workflow run deploy-admin-prod.yml --ref main`.

### 3. **Landing App** (`apps/landing/`)
**Marketing Landing Page**

**Technology Stack:**
- **Framework**: Next.js 15.4.10
- **UI**: React 19.1.2, Tailwind CSS 4.1.7
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
    사고 때 첫 조치: 저장소 변수 `MOBILE_AUTO_OTA` 를 끄고(`gh variable set MOBILE_AUTO_OTA -b false`) 4번으로 롤백.
- **네이티브 변경 = 버전 올림 + 스토어 빌드.** `ios/`·`android/`·네이티브 패키지(예: expo-image)·`app.json`
  플러그인이 바뀌면 **같은 커밋에서** 버전·runtimeVersion 을 올리고(app.json·Expo.plist·strings.xml 등 —
  `ota-updates-config` 테스트가 정렬을 본다) `pnpm --filter mobile native:write` 로 지문 기준을 새로 찍는다.
  안 하면 CI `native:check` 가 막는다(그대로 OTA 가 나가면 옛 바이너리가 실행 즉시 죽는다). 그다음 스토어 빌드·제출.
  - 버전을 올린 뒤 OTA 는 새 runtime 바이너리에만 간다 — 옛 버전용 OTA·hotfix 브랜치는 기본으로 만들지 않는다(하위호환 안 챙김).
    **요청이 있으면 옛 runtime 에도 백포트한다**(2026-10-09 1.4.7·1.4.6 실적): main 을 그대로 보내지 말고(그 사이 네이티브가 바뀌어 죽는다)
    `eas update:view <그 runtime 의 마지막 group> --json` 의 `gitCommitHash` 에 워크트리 → 변경 cherry-pick → 그 커밋 lockfile 로
    `pnpm install --frozen-lockfile` → tsc·`native:check`·jest → **그 커밋으로 Release 시뮬 빌드** 콜드 스타트 2회 → `pnpm ota:publish`.
    로컬 빌드 함정: Xcode 27 은 `IPHONEOS_DEPLOYMENT_TARGET=15.1` 을 넘겨야 옛 Pod 이 빌드되고, `/tmp` 아래 워크트리는 번들 단계가
    경로를 못 찾아 `SKIP_BUNDLING=1` + 위 "번들만 바꿔 끼우기"로 간다. `pod install` 이 바꾼 `Podfile.lock`·`project.pbxproj` 는
    발행 전 커밋본으로 되돌린다(안 하면 `native:check` 가 막는다). 마지막 OTA 커밋이 이미 다음 runtime 으로 올린 커밋이면 재현 불가 — 건너뛴다.
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

- `tokens.js` 가 색(라이트·다크·fixed·브랜드)·사이 글자 크기·모서리·그림자의 **유일한 원본**. web·landing·ai 는 생성된 `theme.css` 를 `@import`, 앱은 `tailwind.config.js` 가 require.
- 토큰을 고치면 `pnpm --filter @jirum/design-system build` 로 theme.css 를 다시 만들어 같이 커밋(커밋 훅이 확인).
- `eslint.js` 가 네 앱에서 hex·Tailwind 기본 팔레트·임의 글자 크기·모서리·그림자·효과 없는 클래스(`text-semibold`)를 막는다.
- 컴포넌트 코드는 플랫폼별(web DOM / 앱 RN)이지만 **모양은 `recipes.js` 한 곳** — Badge·Chip·ProductCardStatus·Switch·탭(앱 TabPill)·섹션 제목(SectionHeader)·바텀시트 겉(web BottomSheetContent)·스켈레톤(Skeleton)·카드 사진 틀(`cardThumb`)·정보 상자(`infoBox`)를 두 플랫폼이 같은 클래스 문자열로 읽는다. 배지·칩·탭·스위치·섹션 제목·시트 가림막·`animate-pulse` 판을 손으로 다시 만들지 말 것(테스트가 막는다)(목록은 패키지 README 「컴포넌트」). 어드민은 범위 밖(TailAdmin).

## 🛠️ Development Guidelines for AI Agents

### Code Quality Standards
1. **TypeScript**: All code must be fully typed
2. **ESLint**: Follow `@jirum/eslint-config-jirum` rules
3. **Prettier**: Use `@jirum/prettier` for consistent formatting
4. **Design System**: 색·글자 크기·모서리·그림자는 토큰만 쓴다(`bg-[#…]`·`text-[13px]`·`text-emerald-700` 금지 — 린트가 막는다). 의미별 색은 `packages/design-system/README.md`

### Architecture Principles
1. **Monorepo Awareness**: Changes may affect multiple applications
2. **Shared Dependencies**: Leverage workspace packages for common functionality
3. **GraphQL**: Use Apollo Client with proper type generation
4. **State Management**: Use Jotai for client state, React Query for server state

### Development Workflow
1. **Install Dependencies**: Always use `pnpm install` at root level
2. **Development**: Use `pnpm dev` for parallel development of all apps
3. **Type Checking**: Run `pnpm check-types` to verify all packages
4. **Linting**: Use `pnpm lint` for code quality checks
5. **Building**: Use `pnpm build` for production builds

### Testing and Quality Assurance
1. **Storybook**: Components should have Storybook stories
2. **MSW**: Use Mock Service Worker for API mocking in development
3. **GraphQL**: Run `pnpm code-gen` after schema changes
4. **Knip**: Use Knip to detect unused code and dependencies

### File Organization
- **Apps**: Feature-specific code in respective `apps/` directories
- **Packages**: Shared functionality in `packages/` directory
- **Configuration**: All config files use workspace references
- **Types**: Shared types should be in appropriate packages or apps

## 🔧 Technology Stack

### Core Technologies
- **Framework**: Next.js 15.4.10 (App Router)
- **Language**: TypeScript 5.8.3
- **Package Manager**: PNPM 10.15.0
- **Monorepo**: Turborepo 2.0.1
- **UI Library**: React 19.1.2

### Styling & UI
- **CSS Framework**: Tailwind CSS 4.x
- **Component Library**: Custom Radix UI-based components
- **Animation**: Motion, Swiper, Tailwind Animate
- **Styling Utils**: Tailwind Merge, Class Variance Authority, CLSX

### Data & State Management
- **GraphQL**: Apollo Client 3.x
- **State Management**: Jotai 2.x
- **Server State**: TanStack React Query 5.x
- **Real-time**: GraphQL WS, Firebase 10.x

### Development & Tooling
- **Code Quality**: ESLint 9.x, Prettier 3.x, Husky, Lint-staged
- **Testing**: Storybook 8.x, MSW 2.x for mocking
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
pnpm --filter admin dev
pnpm --filter landing dev

# Type checking
pnpm check-types

# Linting
pnpm lint

# Building
pnpm build

# Storybook (web app)
pnpm --filter web storybook
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
- Docker support for admin application
- Separate environments for development and production
- Automated CI/CD through repository-integrated workflows

---

**AI Agent Guidelines**: Always work within the monorepo structure, respect shared dependencies, and maintain consistency across all applications. Use workspace references for shared packages and follow the established patterns for each application type.