# 지름알림 디자인 시스템

웹(`apps/web`)·앱(`apps/mobile`)·소개 페이지(`apps/landing`)·AI(`apps/ai`)가 **같은 색·글자·모서리·그림자**를 쓰게 하는 곳이다.
어드민(`apps/admin`)은 운영 도구라 자체 TailAdmin 팔레트를 그대로 쓴다(범위 밖).

**디자인의 정본은 이 패키지다.** Figma 는 2026-10 기준 더 업데이트되지 않는다 — 옛 Figma 의 글자 스타일 14종에 없는
크기(10·11·15·22px)도 여기 토큰이면 정상이다. 색·크기를 바꾸려면 Figma 가 아니라 `tokens.js` 를 고친다.

## 한눈에

값은 한 파일에만 있고, 각 앱은 그 값을 **자기 방식으로 읽기만** 한다. 그리고 린트가 "값을 직접 적는 것"을 막는다.

```
packages/design-system/tokens.js        ← 값은 여기서만 고친다
  ├─ build.mjs → theme.css ───────────→ web · landing · ai   (globals.css 에서 @import, Tailwind v4)
  ├─ require ──────────────────────────→ mobile tailwind.config.js (NativeWind) · useColors()
  └─ eslint.js ────────────────────────→ 네 앱의 린트: hex·기본 팔레트·임의 크기를 쓰면 커밋이 막힌다
```

이렇게 나눈 이유는 예전 모습 때문이다. 같은 팔레트가 네 앱에 복사돼 있었고(다크 값은 web 과 앱에 따로), 화면마다
`bg-[#FBE84C]`·`text-[13px]`·`text-emerald-700` 처럼 토큰을 건너뛴 값이 380곳 넘게 흩어져 있었다. 그러다 보니
카카오 노랑이 세 가지였고, 같은 `rounded-sm` 이 web 에선 4px·앱에선 2px 이었다(Tailwind v4 와 v3 의 기본값이 달라서).
값이 한 곳에 있고 우회가 막혀 있으면 이런 어긋남은 생길 자리가 없다.

컴포넌트는 공유하지 않는다 — web 은 DOM, 앱은 React Native 라 같은 코드를 못 쓴다. 대신 **같은 토큰을 쓰고 이름·props 를 맞춘다**(아래 「컴포넌트」).

## 토큰 바꾸는 법

1. `tokens.js` 를 고친다.
2. `pnpm --filter @jirum/design-system build` — `theme.css` 를 다시 만든다.
3. 둘을 같이 커밋한다. 커밋 훅이 `pnpm --filter @jirum/design-system test` 로 theme.css 가 맞는지·대비가 AA 인지 본다.

앱은 tailwind 설정이 바뀌므로 Metro 캐시를 비우고 다시 띄운다(`npx expo start -c`).
새 글자 크기·모서리·그림자 **이름**은 `twMergeConfig` 로 각 앱 `cn()` 에 자동 등록된다(tokens 에서 파생). 이걸 빼면
tailwind-merge 가 `text-13` 을 색으로 읽어 같은 `cn()` 의 `text-gray-500` 과 합치며 크기를 지운다(2026-10-09 실제로 났다).
새 색을 더하면 `light`·`dark` 둘 다에 넣는다(테스트가 키가 같은지 본다).

## 색 — 언제 무엇을

색 이름은 쓰임새를 따른다. 특히 **빨강(error)은 오류만이 아니라 "싸다"** 다 — 커머스에선 할인이 빨강이라서다.
반대로 일반 가격은 색을 넣지 않는다(회색 글자). 가격에 색을 넣으면 "뭔가 특별하다"로 읽힌다.

| 쓰임새 | 토큰 | 주의 |
| --- | --- | --- |
| 화면 바탕 | `bg-white` | 다크에선 가장 어두운 면(#0C111D)이 된다 |
| 카드·연한 면 / 테두리·칩 / 구분선 | `bg-gray-50` / `border-gray-100`·`bg-gray-100` / `border-gray-200` | |
| 본문 글자 | `text-gray-900` (부제 `700`·`600`) | |
| 보조 글자 | `text-gray-500` 가 최저선 | **`gray-400` 은 글자 금지**(흰 바탕 2.58:1) — 아이콘·구분선만 |
| 브랜드 강조(라임) | `bg-primary-500` + `text-fixed-900` | **라임 위 흰 글자 금지**(1.4:1). 라임 글자는 짙은 면(`bg-gray-800`·`900`) 위에서만 |
| 링크·정보·선택됨 | `secondary` (`text-secondary-600`, `bg-secondary-50`) | |
| 싸다·할인율·최저가 / 오류·알림 점 | `error` (`text-error-500`·`600`, 면 `error-50`) | 일반 가격은 `text-gray-900` |
| 좋음(지금 사도 좋아요·도착보장) | `bg-success-50` + `text-success-700` | 글자는 700 부터(600 은 3.8:1) |
| 주의(평소보다 비싸요) | `bg-warning-50` + `text-warning-700`·`800` | 글자는 700 부터(600 은 3.2:1) |
| 차트 | 강조·나쁨 `error`, 정상·좋음 `secondary`, 중립 `gray-200`·`300` | 기준: web `ReactionChart` |
| 별점 별 | `text-warning-400` | |
| 테마와 무관해야 하는 자리 | `fixed-*` (`text-fixed-white`, `bg-fixed-900`) | 사진 위 배지·짙은 히어로 띠·라임 위 글자·토스트 |
| 외부 브랜드 | `bg-kakao`·`bg-naver` (+ `hover:brightness-95`) | 공식 색. 다른 노랑·초록을 만들지 않는다 |

`rose`·`emerald`·`blue` 같은 Tailwind 기본 팔레트는 쓰지 않는다 — 다크에서 안 뒤집히고, 같은 뜻의 색이 화면마다 갈린다.
대응은 red·rose→`error`, green·emerald→`success`, amber·yellow·orange→`warning`, blue·sky·indigo→`secondary`, slate·zinc→`gray`.

## 다크모드

클래스를 바꾸지 않고 **같은 변수의 값만 바꾼다**. 그래서 `bg-white`·`text-gray-900` 을 그대로 두면 다크에서 알아서 뒤집힌다.

- `white` = 바탕, `gray` = 50↔900 반전. `bg-gray-900 text-white` 버튼은 다크에서 밝은 버튼+어두운 글자가 된다(의도).
- 색 스케일은 300~500 은 그대로, 옅은 면(50~200)은 짙게, 짙은 글자(600~900)는 밝게. 옅은 면은 바탕에 500 을 8·14·24% 섞은 값이다
  (순수 진초록 같은 채도 높은 면은 남색 바탕 위에서 덩어리로 떠 보였다).
- 켜는 곳: web 은 사용자 설정(`COLOR_SCHEME=dark` 쿠키 → `<html class="dark">`), 앱은 OS 설정(내정보 > 화면 모드로 고정 가능).
- `dark:` 는 토큰이 뒤집혀도 모자랄 때만 — 예: 다크 면 위 중간 톤 글자(`text-secondary-500 dark:text-secondary-400`).
- 앱에서 className 이 안 닿는 색(아이콘 `color`·`placeholderTextColor`·StyleSheet)은 hex 대신 `useColors()`, 고정색은 `fixed`
  (`import {fixed} from '@jirum/design-system'`). hex 를 직접 적으면 다크에서 안 바뀐다.

## 글자

Tailwind 이름(크기+줄높이)이 기본이고, 그 **사이 크기만** 숫자 토큰으로 더했다. 숫자 토큰은 이름이 곧 px 이고 줄높이를 갖지 않는다.

| 토큰 | 크기 / 줄높이 | | 토큰 | 크기 / 줄높이 |
| --- | --- | --- | --- | --- |
| `text-10` | 10 / 부모 | | `text-base` | 16 / 24 |
| `text-11` | 11 / 부모 | | `text-lg` | 18 / 28 |
| `text-xs` | 12 / 16 | | `text-xl` | 20 / 28 |
| `text-13` | 13 / 부모 | | `text-22` | 22 / 부모 |
| `text-sm` | 14 / 20 | | `text-2xl` | 24 / 32 |
| `text-15` | 15 / 부모 | | `text-28` | 28 / 부모 |

- 10px 아래는 쓰지 않는다. 작은 글자일수록 대비가 더 필요하다(보조 글자도 `gray-500` 부터).
- 30px 이상(히어로·캠페인 제목)만 `text-[40px]` 같은 임의 값을 허용한다 — 화면마다 달라 토큰으로 묶을 이득이 없다.
- 굵기는 `font-medium`·`font-semibold`·`font-bold`. `text-semibold` 는 Tailwind 에 없는 클래스라 아무 효과가 없다.
  앱은 `AppText` 가 굵기 클래스를 보고 Pretendard 파일을 고른다(RN 은 fontWeight 만으로 굵기별 파일을 못 고른다).
- 앱 `TextInput` 은 줄높이를 주면 iOS 한 줄 입력칸에서 글자가 밀린다 — 입력칸만 크기만 지정한다(`TextField` 참고).

## 모서리 · 그림자

| 모서리 | `xs` 2 · `sm` 4 · `md` 6 · `lg` 8 · `xl` 12 · `2xl` 16 · `sheet` 20 · `3xl` 24 · `full` |
| --- | --- |

이 표는 Tailwind v4 기본과 같지만 tokens.js 에 적어 **앱에도 같이 넣는다** — NativeWind(Tailwind v3)는 `sm` 이 2px 라
web 을 그대로 옮긴 `rounded-sm` 이 앱에서만 2px 였다. 알약·원은 `rounded-full`, 바텀시트 윗모서리는 `rounded-t-sheet`.

그림자는 카드 경계 `shadow-card`(카드엔 테두리가 없어 이게 유일한 경계), 브랜드명 형광펜 밑줄 `shadow-highlight shadow-primary-500`,
그 밖엔 Tailwind `shadow-sm`·`md`·`lg`. 앱(iOS)은 그림자와 `overflow-hidden` 이 같은 View 에서 공존하지 못한다 — 그림자 View 와 자르는 View 를 나눈다.

## 린트 — 막는 것과 예외

`eslint.js` 가 className 문자열(`className="…"`, `cn('…')`, cva 설정, 템플릿 문자열)에서 아래를 막는다. 메시지에 바꿀 토큰이 적혀 있다.

- 임의 hex 색 `bg-[#…]`, Tailwind 기본 팔레트 `text-emerald-700`
- 30px 미만 임의 글자 크기 `text-[13px]`, 임의 모서리 `rounded-[8px]`, 임의 그림자 `shadow-[…]`
- 효과 없는 클래스 `text-semibold`·`rounded-t-5`·`bg-opacity-90`

정말 토큰 밖이어야 하는 자리는 **이유를 적고** 끈다. 지금 예외는 이것뿐이다 — 새로 늘릴 땐 이 목록도 같이 고친다.

```tsx
{/* eslint-disable-next-line no-restricted-syntax -- 광고 소재 색(퍼실 배너 배경에 맞춤) */}
```

| 자리 | 이유 |
| --- | --- |
| web `widgets/promotion/2607siwol` (파일 전체) | 캠페인 페이지 고유 색 |
| web 광고 소재 문구(`HomeContainerV2`, `AdBanner`) | 소재 이미지에 맞춘 색 |
| 소개 배너 짙은 초록(web `AboutLink`, 앱 `HomeBannerCarousel`) | 배너 고유색 |
| 핫딜 배지 그라데이션(web `HotdealBadge`) | 배지 고유 그림(앱과 같은 정지점) |
| 가격 3단계 안내 그라데이션(web `HotDealGuideModal`) | 일러스트 |
| 소개 페이지 히어로(landing `KeyVisual`) | 히어로 모서리·오목한 모서리 트릭 |
| 앱 `TextField` 입력 글자 `text-[16px]` | TextInput 줄높이 문제(위 「글자」) |

린트가 못 보는 것: JS 값으로 넘기는 hex(`color="#101828"`, StyleSheet), CSS 파일, 아이콘·일러스트 SVG. 이건 리뷰에서 본다 —
UI 크롬에 쓰는 hex 는 거의 항상 다크모드 버그다(`useColors()`·`var(--color-…)`·`fixed` 로).

## 컴포넌트

코드는 플랫폼마다 따로지만(web DOM / 앱 RN) **모양은 한 곳**이다. `recipes.js` 에 컴포넌트의 클래스 문자열을
겉(box)·글자(text)로 나눠 두고, web·앱 컴포넌트가 둘 다 그걸 읽는다(web 은 한 요소에, 앱은 View·Text 에 나눠 건다).
예전엔 같은 배지를 두 번 적어 굵기·색·글자 크기가 갈렸다 — 새 공용 부품의 모양도 recipes 에 두고, 컴포넌트엔 배치만 적는다
(`__tests__/design-system-component-parity.test.ts` 가 두 플랫폼이 레시피를 읽는지·색을 직접 적지 않는지 본다).
새 화면은 아래부터 찾아 쓰고, 없으면 직접 만들기 전에 짝(web↔앱)을 먼저 grep 한다.

- **Badge**(누를 수 없는 라벨) — `size`: xs 10px·sm 11px·md 12px 정보 태그, tag = 22px 상태 태그(판매종료·핫딜).
  `variant`·`tone`: soft(gray·secondary·success·warning·error) / solid(gray=사진 위·secondary·error) / outline(gray).
  `pill` = 판정 배지(역대 최저·평소보다 비싸요). 예: `<Badge tone="success">도착보장</Badge>`, `<Badge size="tag" variant="outline">판매종료</Badge>`.
- **Chip**(고르는 칩: 필터·탭) — `selected`, `size` md(탭)·sm(필터)·xs(하위 탭). 골라서 굵어져도 너비가 그대로다(굵은 글자 너비를 미리 잡음). 앱은 누르면 햅틱.
- **ProductCardStatus**(상품 카드 사진 위 판매종료·핫딜 배지·유통기한 띠) — 카드 종류와 무관하게 이것만 쓴다. 같은 상품이
  화면마다 다르게 보이면 버그로 읽힌다. 유통기한 띠가 있으면 핫딜 배지는 숨긴다. 모서리 라벨만 필요하면 `CardCornerLabel`.

| 개념 | web | 앱 |
| --- | --- | --- |
| 버튼 | `shared/ui/common/Button` (`buttonVariant`) | `shared/components/ui/Button` (`buttonVariant`, `loading`) |
| 입력칸 | `shared/ui/common/Input` | `shared/components/ui/Text/TextField` |
| 글자 | (DOM) | `shared/components/ui/Text/AppText` — 모든 Text 는 이걸로 |
| 토스트 | `shared/ui/common/Toast` (`useToast`) | `shared/components/AppToast` (`showToast.*`) |
| 확인 | `shared/ui/common/AlertDialog` | `shared/components/ConfirmSheet` |
| 바텀시트 | vaul `Drawer` + `rounded-t-sheet` | `shared/components/BottomSheet` |
| 핫딜 배지 | `shared/ui/HotdealBadge` | `shared/components/product/HotdealBadge` |
| 배지·태그 | `shared/ui/common/Badge` | `shared/components/ui/Badge` |
| 고르는 칩 | `shared/ui/common/Chip` | `shared/components/ui/Chip` |
| 카드 사진 위 상태 | `entities/product-list/ui/ProductCardStatus` | `shared/components/product/ProductCardStatus` |
| 스켈레톤 | 화면별 `animate-pulse` | `shared/components/Skeletons` |
| 섹션 오류 | `ApiErrorBoundary` | `shared/components/SectionErrorRow` |

아직 공용 부품이 없어 화면마다 손으로 만든 것(2026-10 조사, 다음에 묶을 후보 — 많이 반복되는 순):
카드 틀(web 37·앱 19), 섹션 제목(앱엔 공용 없음), 스위치·체크박스·탭, 짙은 알약 탭(`bg-gray-900`/`bg-gray-100`, web 3·앱 2),
링크 칩(web 3), web 스켈레톤·빈 화면, 바텀시트 겉껍데기(web 에 같은 오버레이 8벌), 토스트 API(web·앱이 다름).
묶을 때도 값은 이 토큰만 쓰고, 모양은 recipes 에 둔다.

Storybook(web 공용 컴포넌트): `pnpm --filter web storybook`.

## 검증

- `pnpm --filter @jirum/design-system test` — theme.css 가 tokens.js 그대로인지, 라이트·다크 키가 같은지,
  위 「색」 표의 글자·바탕 조합이 두 테마 모두 AA(4.5:1) 이상인지, 린트 정규식이 잡을 것만 잡는지.
  레시피(recipes.js)의 글자·바탕도 두 테마 AA·린트 규칙 준수·토큰에 있는 색인지 같이 본다.
- 앱: `apps/mobile/__tests__/dark-mode-palette.test.ts` — tailwind 설정이 토큰을 변수로 까는지, AppText 의 색 판정.
  `cn-design-tokens.test.ts` — cn() 이 사용자 정의 값을 지우지 않는지. `design-system-component-parity.test.ts` — web·앱 컴포넌트가 같은 레시피를 읽는지.
