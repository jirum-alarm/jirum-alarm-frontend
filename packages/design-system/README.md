# 지름알림 디자인 시스템

웹(`apps/web`)·앱(`apps/mobile`)·소개 페이지(`apps/landing`)·AI(`apps/ai`)·뷰티(`apps/beauty-web`)와 놀이터(`apps/design`)가
**같은 색·글자·모서리·그림자**를 쓰게 하는 곳이다.
어드민(`apps/admin`)은 운영 도구라 자체 TailAdmin 팔레트를 그대로 쓴다(범위 밖).

**디자인의 정본은 이 패키지다.** Figma 는 2026-10 기준 더 업데이트되지 않는다 — 옛 Figma 의 글자 스타일 14종에 없는
크기(10·11·15·22px)도 여기 토큰이면 정상이다. 색·크기를 바꾸려면 Figma 가 아니라 `tokens.js` 를 고친다.

## 한눈에 — 다섯 층

새 화면은 **이미 있는 조각을 골라, 정해진 규칙대로 조립**한다. 숫자·색을 새로 고르지 않는다.
값은 아래층에서 위층으로만 흐르고, 위층은 아래층의 **이름**만 쓴다.

| 층 | 무엇 | 원본 | 놀이터 |
| --- | --- | --- | --- |
| 1. 토큰 | 색·글자 크기·모서리·그림자·차트 색 | `tokens.js` | 기초 |
| 2. 레시피 | 부품 모양(클래스 문자열) — web·앱이 같은 값을 읽는다 | `recipes.js` | 레시피 |
| 3. 부품 | 플랫폼별 컴포넌트(web DOM·앱 RN)와 「언제 쓰나」 | `catalog.js` (목록) | 소개/부품 지도 · components |
| 4. 조립 규칙 | 화면 여백·섹션 간격·묶음 간격·조작 높이·아이콘 크기 | `layout.js` | 조립 규칙 |
| 5. 화면 | 부품을 규칙대로 놓은 것 | 각 앱 | 조립 규칙/간격·크기 › 조립 예시 |

```
packages/design-system/tokens.js        ← 값은 여기서만 고친다
  ├─ build.mjs → theme.css ───────────→ web · landing · ai   (globals.css 에서 @import, Tailwind v4)
  ├─ require ──────────────────────────→ mobile tailwind.config.js (NativeWind) · useColors()
  └─ eslint.js ────────────────────────→ 위 여섯 앱의 린트: hex·기본 팔레트·임의 크기를 쓰면 커밋이 막힌다
recipes.js · layout.js ────────────────→ web·앱 컴포넌트와 화면이 클래스 이름으로 읽는다
catalog.js ────────────────────────────→ 놀이터 「부품 지도」 + catalog.test.mjs(경로·레시피·스토리가 실제로 있는지)
apps/design ───────────────────────────→ 놀이터(Storybook): 만지기 + 스토리마다 라이트·다크 렌더·조작·접근성 자동 검사
```

**화면을 만들 때 순서**: ① 놀이터 「부품 지도」(또는 `catalog.js`)에서 조각을 찾는다 → ② 놓을 때 간격·높이는 `layout.js` 기준표의 값으로
(클래스는 그대로 `px-5`·`gap-2` — layout.js 는 어떤 값을 고를지 정한 표지, import 해서 쓰라는 게 아니다) →
③ 없으면 web↔앱 짝을 먼저 grep 하고, 새로 만들면 모양은 `recipes.js`, 목록은 `catalog.js`, web 부품 옆에 스토리.
등록이나 스토리를 빼먹으면 `catalog.test.mjs` 가 커밋을 막는다.

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
| 보조 글자 | `text-gray-500` 가 최저선(placeholder 도) | **`gray-300`·`400` 은 글자 금지**(흰 바탕 1.47·2.58:1) — 아이콘·구분점·비활성만. 글자 크기 클래스와 같이 쓰면 린트가 막는다 |
| 브랜드 강조(라임) | `bg-primary-500` + `text-fixed-900` | **라임 위 흰 글자 금지**(1.4:1). 라임 글자(500)는 테마 무관 짙은 면(`bg-fixed-800`·`900`) 위에서만 — `bg-gray-800`·`900` 은 다크에서 밝아져 1.4~1.6:1. 밝은 면 위 라임 글자는 `text-primary-800`(8.6:1, 600 은 2.0·700 은 4.2) |
| 링크·정보·선택됨 | `secondary` (`text-secondary-600`, `bg-secondary-50`) | |
| 싸다·할인율·최저가 / 오류·알림 점 | 글자는 `text-error-600`(면 `error-50`), 점·면은 `bg-error-500` | 일반 가격은 `text-gray-900`. `text-error-500` 은 24px 굵은 큰 가격만 — 작은 글자는 다크 카드 위 3.2:1 |
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
- **짙은 면을 고를 때**: 다크에서도 짙어야 하나(사진 위·토스트·라임 위 글자)? → `fixed-*` / 바탕과 반대면 되나(다크에선 밝은 면이어도 됨)? → `gray-*`.
- `text-black` 은 토큰이 아니라 `#000` 그대로라 다크에서 검은 바탕에 검은 글자가 된다(린트가 막는다) — 바탕 위 글자는 `text-gray-900`, 색 판 위는 `text-fixed-900`.
- `dark:` 는 토큰이 뒤집혀도 모자랄 때만 — 예: 랭킹 탭 선택(`bg-fixed-800 dark:bg-gray-900`, fixed-800 이 다크 비활성 면과 같은 색이라). 옅은 색 면(`bg-secondary-100`) 위 글자는 `dark:` 대신 700 을 쓰면 두 테마 다 AA 다.
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

- 10px 아래는 쓰지 않는다. 작은 글자일수록 대비가 더 필요하다(보조 글자도 `gray-500` 부터). 색 면 위 글자는 대비 표(`tokens.test.mjs` TEXT_ON_SURFACE)에 있는 짝만 — 새 짝은 거기 한 줄 더하면 두 테마 AA 를 테스트가 본다.
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

## 조립 규칙 — 간격 · 크기 (`layout.js`)

부품끼리 얼마나 떨어지고 얼마나 큰가. 값은 2026-10-16 web·앱 화면의 다수 값을 실측해 고정했다(지어낸 값이 아니다).
Tailwind 기본 간격이라 web·앱이 같은 클래스로 같은 값이 된다. `import {layout} from '@jirum/design-system/layout'`.

| 이름 | 값 | 쓰는 곳 |
| --- | --- | --- |
| `gutter` | `px-5` 20 | 화면 좌우 여백(web 165·앱 95곳 — 다수) |
| `sectionHeader` | `h-14` 56 | 섹션 제목 줄 |
| `sectionGap` | `gap-y-8` 32 | 화면 안 섹션 사이(web 홈) |
| `sectionPadding` | `py-6` 24 | 제목 줄 없는 섹션 위아래 |
| `stack.tight·base·loose` | `gap-1`·`gap-2`·`gap-3` | 붙는 글자 줄 · 항목 사이 · 묶음 사이 |
| `inline.chip·icon` | `gap-2`·`gap-1` | 칩 줄 · 아이콘과 글자 |
| `control.primary·touch·tab·compact` | `h-12`·`h-11`·`h-9`·`h-8` | 주 버튼 · 글자 버튼/눌리는 행(44) · 탭 · 작은 칩 |
| `icon.nav·action·row·inline` | 28·24·20·16 | 헤더·하단 탭 · 줄 끝 동작 · 목록 행/버튼 안 · 글자 옆 |
| `minTouch` | 44 | 누르는 것의 최소 크기(작은 아이콘은 패딩·hitSlop 으로 채운다) |

## 아이콘

놀이터 「기초/아이콘」이 web 아이콘 폴더를 전부 모아 보여 준다(새 파일은 등록 없이 나온다) — 툴바 「테마」를 다크로 바꿔 바탕에 묻히는 게 없는지 본다.

- **한 색 아이콘은 `currentColor`** — 놓인 자리의 글자 색(`text-gray-900`, 라임 버튼 위 `text-fixed-900`)을 따른다. 2026-10-17 web 하단 탭 「발견」이
  `fill="black"`, 로그인 이메일 아이콘이 `#344054` 로 박혀 있어 다크에서 안 보였다.
- **회색 그림**(카테고리 꺼짐 아이콘·빈 사진 그림)은 `var(--color-gray-N)` — 라이트 픽셀은 같고 다크에서 뒤집힌다. 그림 안 흰 면은 `var(--color-white)`(바탕색).
  앱은 같은 그림을 `useColors()` 로 그린다(앱이 먼저 이렇게 돼 있었고 web 이 hex 로 남아 있었다).
- **브랜드·그림 고유색**(라임·카카오·마스코트 그라데이션·카테고리 켜짐 아이콘의 색)은 hex 그대로 — 테마가 바뀌어도 같은 그림이어야 한다.
- 크기는 조립 규칙 `icon`(28·24·20·16), 누르는 아이콘은 `minTouch` 44 를 패딩·hitSlop 으로 채운다.

## 포커스·움직임

- **키보드 포커스**는 한 모양 — `tokens.js` `focusRing`(secondary-500, 2px, 바깥 2px)을 theme.css 가 `:focus-visible` 에 그린다(web·ai·landing·beauty-web).
  예전엔 브라우저 기본 링과 자리마다 고른 ring-gray-400·primary-500·gray-900 이 섞여 있었다. 두 테마 바탕·연한 면 위 3:1 이상을 테스트가 본다.
  입력칸처럼 테두리 색으로 포커스를 보이는 자리는 `outline-none focus:border-*` 그대로. 포커스를 없애기만 하는 `focus-visible:outline-none` 은 린트가 막는다.
- **「동작 줄이기」**(OS 설정)를 켠 사람에겐 움직임을 멈춘다 — web 은 `MotionConfig reducedMotion="user"`(위치·크기 애니메이션 끔, 투명도는 남김)와
  CSS `motion-safe:`(스켈레톤 깜빡임), 앱은 Reanimated 기본값(시스템 설정을 따른다). 새 CSS 애니메이션은 `motion-safe:` 를 붙인다.

## 차트 색 (`chart`)

차트는 역할 이름으로 칠한다 — web `chartVar('line')`(→ `var(--color-secondary-500)`, 다크 자동), 앱 `chartColor('line', useColors())`.
역할: `line`·`current`(secondary-500) · `guide`(secondary-300) · `low`(error-500) · `high`(secondary-700) · `grid`(gray-200) · `axis`(gray-500).
예전엔 같은 가격 추이 그래프가 web 파랑(Tailwind blue)·앱 라임·AI 파랑 세 가지였다.

## 린트 — 막는 것과 예외

`eslint.js` 가 className 문자열(`className="…"`, `cn('…')`, cva 설정, 템플릿 문자열)에서 아래를 막는다. 메시지에 바꿀 토큰이 적혀 있다.

- 임의 hex 색 `bg-[#…]`, Tailwind 기본 팔레트 `text-emerald-700`
- 30px 미만 임의 글자 크기 `text-[13px]`, 임의 모서리 `rounded-[8px]`, 임의 그림자 `shadow-[…]`
- 효과 없는 클래스 `text-semibold`·`rounded-t-5`·`bg-opacity-90`
- 눈금에 이름이 있는 간격·크기를 숫자로 `w-[48px]`·`gap-[8px]`(→ `w-12`·`gap-2`) — 두 플랫폼에 같은 이름이 있는 Tailwind v3 기본 눈금만 막는다
- 아이콘·SVG 색 속성(`fill`·`stroke`·`color`·`stopColor`)의 검정·회색 hex(`fill="black"`·`fill="#344054"`) — className 이 아니라 위 규칙이 못 보던 자리.
  한 색 아이콘은 `currentColor`, 회색 그림은 `var(--color-gray-N)`(앱은 `useColors()`). 브랜드·그림 고유색 hex 와 mask·clipPath 는 막지 않는다
- 자리마다 고른 포커스 링 `focus-visible:ring-*`·`focus-visible:outline-none` — 공용 링(아래 「포커스·움직임」)을 쓴다
- 2px 단위 밖 여백(홀수 px) `px-[7px]`·`gap-x-[25px]` — 정확히는 홀수만 막는다(`gap-[6px]` 는 통과하지만 그 값은 이름 `gap-1.5` 가 있어 위 규칙에 걸린다).
  눈금 이름이 있으면 이름으로, 가능하면 4px 눈금(`layout.js`). 레이아웃 고유 치수(`w-[120px]`·`max-w-[600px]`·`h-[81px]`)는 막지 않는다

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
| 핫딜 배지 그라데이션(beauty-web `widgets/ProductCard`) | web·앱 HotdealBadge 와 같은 정지점 |
| 소개 페이지 히어로(landing `KeyVisual`) | 히어로 모서리·오목한 모서리 트릭 |
| 앱 `TextField` 입력 글자 `text-[16px]` | TextInput 줄높이 문제(위 「글자」) |
| web 아이콘 `Jirume`(마스코트 눈)·`RoundedLogo`(로고 마크)·`Illust/AppIcon`(앱 아이콘 남색) | 브랜드 그림 — 테마와 무관하게 검정·남색 |

린트가 못 보는 것: StyleSheet·변수로 넘기는 hex, CSS 파일, 브랜드색처럼 회색이 아닌 hex. 앱은 `no-hex-in-ui-chrome` 테스트가 src 의 hex 를,
`design-system-demos-render` 테스트가 다크에 남은 라이트 회색을 잡는다. 그 밖엔 리뷰에서 본다 —
UI 크롬에 쓰는 hex 는 거의 항상 다크모드 버그다(`useColors()`·`var(--color-…)`·`fixed` 로).

## 컴포넌트

코드는 플랫폼마다 따로지만(web DOM / 앱 RN) **모양은 한 곳**이다. `recipes.js` 에 컴포넌트의 클래스 문자열을
겉(box)·글자(text)로 나눠 두고, web·앱 컴포넌트가 둘 다 그걸 읽는다(web 은 한 요소에, 앱은 View·Text 에 나눠 건다).
예전엔 같은 배지를 두 번 적어 굵기·색·글자 크기가 갈렸다 — 새 공용 부품의 모양도 recipes 에 두고, 컴포넌트엔 배치만 적는다
(`__tests__/design-system-component-parity.test.ts` 가 두 플랫폼이 레시피를 읽는지·색을 직접 적지 않는지 본다).

**부품 목록의 정본은 `catalog.js`** — 무엇이 있고(이름·언제 쓰나·web/앱 경로·레시피), 어디서 만져 보나(놀이터 「소개/부품 지도」).
이 절엔 목록을 다시 적지 않고 **고를 때의 규칙과 이유**만 둔다. 공용 폴더(web `shared/ui`·앱 `shared/components`)에 부품을 만들면
카탈로그에 한 줄 올리거나 `catalog.test.mjs` 의 `NOT_PARTS` 에 올리지 않는 이유를 적는다 — 둘 다 없으면 커밋이 막힌다.

### 무엇을 고르나

- **칩·탭·링크 칩**: 고르면 아래 목록이 통째로 바뀌나 → 탭(`tab`) / 조건을 더하나(필터) → 고르는 칩(Chip) / 다른 페이지로 가나 → 링크 칩(`linkChip`).
  web 에는 탭 컴포넌트가 없다 — 각 자리의 `<button>` 이 `tab` 레시피를 읽는다(예: web 랭킹 카테고리 탭, 커뮤니티 탭).
- **배지와 칩**: 누를 수 없으면 Badge, 누르면 Chip. 판정(역대 최저·평소보다 비싸요)은 `pill` 배지.
- **토스트와 확인 창**: 이미 일어난 결과를 알리면 토스트, 되돌릴 수 없는 동작 전에 묻는 건 확인 창.
- **글자**: 먼저 `text` 역할(display·title·subtitle·label·body·muted·caption). 홈·목록 섹션 제목은 `sectionTitle`, 카드 가격은 `productCard.price`.
- **빈 화면**: 컴포넌트가 아니라 패턴 — 그림 + `text.display` + 설명 + 다음 동작(놀이터 「패턴/빈·오류 상태」). 목록 한 줄은 `emptyText`.

### 부품별 규칙

- **Badge** — `size`: xs 10px·sm 11px·md 12px 정보 태그, tag = 22px 상태 태그(판매종료·핫딜).
  `variant`·`tone`: soft(gray·secondary·success·warning·error) / solid(gray=사진 위·secondary·error) / outline(gray).
- **Chip** — `selected`, `size` md·sm·xs. 골라서 굵어져도 너비가 그대로다(굵은 글자 너비를 미리 잡음). 앱은 누르면 햅틱.
- **카드 사진 위 상태**(ProductCardStatus) — 카드 종류와 무관하게 이것만 쓴다. 같은 상품이 화면마다 다르게 보이면 버그로 읽힌다.
  유통기한 띠가 있으면 핫딜 배지는 숨긴다. 모서리 라벨만 필요하면 `CardCornerLabel`.
- **Switch** — web·앱 같은 44x24, 켜짐 = primary-500, 노브는 테마 무관 흰색. web 은 `role="switch"` 버튼이라 옆 `<label htmlFor>` 로 이름을 준다.
- **탭**(`tab`) — neutral = 커뮤니티·토스 하위 카테고리·큐레이션 / brand = 랭킹·핫딜 모음 카테고리(라임) / segment = 기간 고르기(네모 + 테두리).
  높이 sm 32·md 36. 비활성 글자는 전부 gray-600 — gray-500 은 gray-100 위에서 4.51:1 경계값이다.
- **섹션 제목**(`sectionTitle`) — page = 홈·목록 섹션(bold, h-14 + 더보기), detail = 상세 안 섹션(semibold).
- **화면 헤더**(`pageHeader`) — 56px, 제목 왼쪽(`text.title`). 예전엔 앱 내정보 탭만 제목이 가운데였고 56 이 세 파일에 따로 적혀 있었다.
- **목록 행**(`listRow`) — 작은 회색 묶음 제목 + 아이콘·제목·값·화살표. 앱 행은 PressableScale 대신 opacity·ripple(폭이 꽉 차 축소가 어색하다).
- **상품 카드**(`productCard`) — 제목 2줄 고정(48px), 가격은 캐러셀·목록 18px·그리드 16px. 같은 그리드 카드 가격이 web 16·앱 18 로 갈려 있었다.
- **권유 카드**(`promptCard`) — 상세 안 다음 행동(쿠팡 검색 = neutral, 카톡방 = brand). 면은 옅게 두고 테두리 알약으로만 눈에 띄게 —
  진한 면으로 올리면 상세에서 가장 강한 요소가 되어 구매 버튼과 경합한다.
- **버튼**(`button`, `buttonTone`) — lg 48px 가득(주 버튼 라임), md·sm 작은 버튼(주 버튼이면 짙은 판 + 라임 글자), 보조·위험·테두리.
  줄 끝 작은 동작은 `button.size.xs`(32px) + `tone.neutralOutline`(회색 테두리) — Link·PressableScale 에도 걸려 레시피를 바로 읽는다.
  누르면 면이 한 단계 진해진다. (variant, color, size) → 모양 고르기는 `buttonTone` 하나.
- **바텀시트 겉**(`sheet`) — 가림막 40% 검정·윗모서리 20px·손잡이 40x4. 다크에선 판 위 테두리 한 줄(판이 바탕색이라 경계가 안 보였다).
- **토스트**(`toast`) — 짙은 판(fixed-800, 테마 무관)·왼쪽 흰 글자·오른쪽 라임 동작. 성공(체크)·실패(느낌표)·안내(아이콘 없음),
  동작 버튼이 있으면 4초, 없으면 2.5초. web 은 `const {toast} = useToast()` 후 `toast.success(msg, {action: {label, onClick}})`·`toast.error(msg)`·`toast(msg)`,
  앱은 `showToast.success·error·info`. 실패 문구에 success 를 쓰면 테스트가 막는다.
- **단어 태그**(`wordTag`) — 알약 모양. 앱은 Text 하나에 면을 주면 iOS 가 둥근 면을 안 잘라서 View(겉)·Text(글자)로 나눈다.
- **빈 목록 한 줄**(`emptyText`, text-sm gray-500) — gray-400 은 AA 미달이라 쓰지 않는다.
- **스켈레톤**(`skeleton`, gray-200) — gray-100 은 깜빡임과 겹치면 흰 바탕에서 안 보였다. web 은 「동작 줄이기」면 깜빡임을 멈춘다.

### 플랫폼 관례

- 앱의 모든 글자는 `shared/components/ui/Text/AppText` — 굵기 클래스로 Pretendard 파일을 고른다.
- 앱 체크 표시는 `CheckIcon` — ✓ 글리프는 글꼴에 없으면 두부(□)가 된다. 체크박스는 web 1곳·앱 1곳이라 부품으로 묶지 않았다.

## 놀이터 (`apps/design`)

Storybook 서브 앱. 기초(색·글자·모서리)·조립 규칙·레시피 갤러리·부품 지도는 이 앱에, web 컴포넌트 스토리는 **컴포넌트 옆**(`apps/web/src/**/*.stories.tsx`)에 두고 놀이터가 모아 보여 준다.
앱(RN) 부품은 실기기 렌더가 진짜라 앱 안 숨은 화면 「디자인 시스템」(딥링크 `jirumalarm://design-system`)에서 본다.

- 만지기: `pnpm --filter design storybook` (툴바 「테마」로 다크, 오른쪽 아래 Controls 로 props)
  - `packages/design-system/*.js`(레시피·토큰)를 고쳤으면 **storybook 을 다시 켠다** — CommonJS 라 Vite 가 미리 변환해 두는데, 그 캐시 이름(패키지 내용 해시)은 켤 때 한 번만 정해진다. 안 그러면 옛 레시피가 보인다.
- 검증: `pnpm --filter design test:stories` — 모든 스토리를 **라이트·다크 두 번** 렌더 + play 함수(조작 시나리오) + axe 접근성(대비 AA·이름 없는 버튼·라벨 없는 입력칸)을 `error` 로. 처음 돌렸을 때 입력칸 도움말 gray-400(AA 미달)·이름 없이 읽히는 Select 를 찾았다.
- CI·배포: `.github/workflows/design-system.yml` — main 푸시면 같은 검증 후 배포.
- 새 스토리 규칙: 인터랙티브 부품은 play 함수로 "눌러서 바뀌는지"를 적는다. a11y 규칙을 끄는 건 테스트 환경 탓(포털·애니메이션)일 때만, 이유 주석과 함께.

## 검증

- `pnpm --filter @jirum/design-system test` — theme.css 가 tokens.js 그대로인지, 라이트·다크 키가 같은지,
  위 「색」 표의 글자·바탕 조합이 두 테마 모두 AA(4.5:1) 이상인지, 린트 정규식이 잡을 것만 잡는지.
  레시피(recipes.js)의 글자·바탕도 두 테마 AA·린트 규칙 준수·토큰에 있는 색인지 같이 본다.
- 앱: `apps/mobile/__tests__/dark-mode-palette.test.ts` — tailwind 설정이 토큰을 변수로 까는지, AppText 의 색 판정.
  `cn-design-tokens.test.ts` — cn() 이 사용자 정의 값을 지우지 않는지. `design-system-component-parity.test.ts` — web·앱 컴포넌트가 같은 레시피를 읽는지.
  `design-system-demos-render.test.tsx` — 앱 놀이터 데모(카탈로그 앱 부품 전부)를 라이트·다크로 그려 던지지 않는지, 다크에 라이트 회색이 남지 않는지
  (web 스토리의 두 테마 검사에 해당하는 앱 쪽 자동 검사).
