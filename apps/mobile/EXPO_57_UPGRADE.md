# Expo SDK 54 → 57 업그레이드 — 실측 견적

2026-09-05, 격리 worktree에서 실제로 올려보고 측정했다. **추정이 아니라 실행 결과다.**
재조사는 비싸니(설치 20초 + tsc/jest 여러 번) 이 문서를 먼저 볼 것.

## 결론부터

**생각보다 싸다.** 막는 것은 딱 하나, `react-native-screens`의 탭 API 재편이다.

| 측정 | 결과 |
| --- | --- |
| `pnpm install` | 성공 (peer 경고는 web 쪽 기존 이슈) |
| `tsc --noEmit` | **에러 5개** (아래 전부 나열) |
| `jest` | **490개 전부 통과** (preset 한 줄 고친 뒤) |
| `expo-doctor` | 1개 실패 — babel·@types/react·TypeScript 버전 |

## 버전 점프

| | 54 (현재) | 57 |
| --- | --- | --- |
| react-native | 0.81.5 | 0.86.3 |
| react | 19.1.0 | 19.2.3 |
| Gradle | 8.14.3 | 9.3.1 (JDK 17+) |
| iOS 최소 | 15.1 | 16.4 |
| Expo 패키지 | 개별 버전(`expo-updates@29`) | **통합 57.x** (`expo-updates@57`) |

⚠️ Expo 패키지가 전부 `57.x` 통합 체계로 바뀐다. `expo-haptics@15` → `57.0.2` 처럼
숫자가 내려가 보이지만 정상이다.

## 고쳐야 할 것 — 전부

### 1. jest preset (1줄, 필수)

```
The React Native Jest preset has moved to a separate package.
```

```diff
- preset: 'react-native',
+ preset: '@react-native/jest-preset',
```
`@react-native/jest-preset` 을 devDependency 로 추가. **이것만 하면 490개 전부 통과한다.**

### 2. `StyleSheet.absoluteFillObject` 제거 (2곳, 사소)

`WebViewErrorView.tsx:25` · `WebViewLoadingIndicator.tsx:14`.
`absoluteFill` 로 교체하거나 객체를 직접 쓴다.

### 3. ★ `react-native-screens` 탭 API 재편 (진짜 관문)

`createNativeBottomTabNavigator.tsx`(293줄) 한 파일에 격리돼 있다.
다른 코드는 이 파일이 내보내는 인터페이스만 쓰므로 **blast radius 는 이 파일뿐**이다.

```diff
- import {BottomTabs, BottomTabsScreen} from 'react-native-screens';
+ import {Tabs} from 'react-native-screens';   // Tabs.Host / Tabs.Screen
```

**단순 개명이 아니다 — 상태 제어 모델이 바뀌었다.**

| 54 | 57 |
| --- | --- |
| `BottomTabs` / `BottomTabsScreen` | `Tabs.Host` / `Tabs.Screen` |
| 화면마다 `isFocused` 나열 | Host 에 **`navStateRequest`** 하나 (`{selectedScreenKey, baseProvenance}`) |
| `tabKey` | `screenKey` |
| `experimentalControlNavigationStateInJS` | (없음 — `navStateRequest` 가 그 역할) |
| `iconResource`(Android) / `icon`(iOS) 평면 | **`android: {...}` / `ios: {...}` 객체로 분리** |
| `tabBarItemTitleFontColorActive` | 플랫폼 객체 안으로 이동 |
| `onNativeFocusChange` | 유지 (+ `onTabSelected` 가 provenance 를 준다) |

살아남는 prop: `title` `icon` `selectedIcon` `standardAppearance`
`scrollEdgeAppearance` `badgeValue` `specialEffects`
`overrideScrollViewContentInsetAdjustmentBehavior`
`tabBarBackgroundColor` `tabBarMinimizeBehavior` `tabBarItemLabelVisibilityMode`

#### `baseProvenance` 를 이해하고 써야 한다

비동기 네비게이션의 상태 충돌을 막는 장치다. 네이티브가 상태 보유자이고,
JS 는 **마지막으로 확인받은 상태의 provenance** 를 실어 변경을 요청한다.
`rejectStaleNavStateUpdates` 와 짝. 대충 0 을 넣으면 경합에서 조용히 깨진다.

⚠️ **탭바는 이 레포에서 이미 8번 고친 영역이다.** 특히
`scrollEdgeAppearance` 를 비우면 다크모드에서 탭바만 검게 뜬다(c8bc3e8e).
마이그레이션 후 **다크모드 + 스크롤 상태**를 반드시 눈으로 확인할 것.

### 4. expo-doctor 잔여 3건

`@babel/core@^7.29` · `@types/react@~19.2.4` · **`typescript@~6.0.3`**.
TypeScript 6 은 메이저다 — 모노레포 전체(web·admin·ai)에 영향이 가므로
**이번 업그레이드에 묶지 말고 따로 판단**하는 편이 낫다. doctor 를 빨간불로 두고
갈지, TS 6 까지 갈지는 별도 결정.

## 네이티브 쪽 (측정 안 함 — 실제 빌드 필요)

bare 라 `android/`·`ios/` 는 손으로 따라가야 한다. **`expo prebuild` 는 이 레포에서 못 쓴다** —
매니페스트가 `android:name="com.solcode.jirmalam.MainActivity"` 정규화 이름을 써서
Expo 파서가 거부한다(`AndroidManifest.xml is missing the required MainActivity element`).
게다가 prebuild 는 네이티브 설정을 조용히 날린 전력이 있다(로그인 스킴·버전).

→ **템플릿 diff 로 따라가야 한다.** `expo-template-bare-minimum@sdk-57` 을 받아
`android/build.gradle`·`gradle-wrapper.properties`·`gradle.properties`·pbxproj 를
1:1 대조하고 필요한 것만 옮긴다.

알려진 항목:
- Gradle wrapper 8.14.3 → 9.3.1
- `IPHONEOS_DEPLOYMENT_TARGET` 15.1 → 16.4 (pbxproj 4곳)
- `edgeToEdgeEnabled=true` (57 템플릿 gradle.properties 에 있음)
- 비번들 네이티브 메이저 업: firebase 21→26, kakao 5→6, naver 4→5,
  bootsplash 6→7, sentry 7→8. **각각 마이그레이션 노트 확인 필요.**
  (이번 프로브는 이들을 올리지 않았다 — 올리면 표면이 더 커진다.)

## 권장 순서

1. Android 1.4.5 먼저 출고한다(이 업그레이드와 **섞지 말 것**).
2. jest preset + absoluteFillObject 를 별도 커밋으로 (54 에서도 무해).
3. `createNativeBottomTabNavigator` 를 `Tabs.Host`/`Tabs.Screen` 으로 재작성.
4. 비번들 네이티브를 하나씩 올린다(한 번에 올리면 원인 분리가 안 된다).
5. `runtimeVersion` 을 1.5.0 으로 올려 **OTA 를 격리**한다 —
   네이티브가 바뀌므로 기존 1.4.5 빌드에 새 번들이 꽂히면 안 된다.
6. 양쪽 스토어 빌드 → 실물(IPA/AAB)에서 OTA 설정 확인.
