/**
 * 조립 규칙 — 부품(recipes·컴포넌트)을 화면에 **놓을 때**의 간격·크기. 토큰이 "무슨 값", 레시피가 "부품 모양"이면
 * 이 파일은 "부품끼리 얼마나 떨어지고 얼마나 큰가"다. 새 화면은 여기 이름으로 조립하고, 숫자를 새로 고르지 않는다.
 *
 * 값은 지어낸 게 아니라 2026-10-16 web·앱 화면의 다수 값을 실측해 고정한 것이다(괄호 = web·앱 사용 횟수).
 * Tailwind 기본 간격(4px 단위)이라 web(v4)·앱(NativeWind v3) 둘 다 같은 클래스로 같은 값이 된다.
 *
 *   화면 ┬ 좌우 여백 gutter(20)
 *        ├ 섹션 ─ 섹션 제목 줄(56) + 내용
 *        │    섹션 사이 sectionGap(32)
 *        ├ 섹션 안 묶음 사이 stack.loose(12) · 항목 사이 stack.base(8) · 글자 줄 사이 stack.tight(4)
 *        └ 조작 요소 높이 control · 아이콘 크기 icon · 손가락 최소 44
 */

const layout = {
  /** 화면 좌우 여백 20px — 본문·섹션·목록 모두(px-5: web 165·앱 95, 그다음 px-4 가 45·21). 가로 스크롤 줄도 안쪽 여백을 이 값으로. */
  gutter: 'px-5',
  /** 섹션 제목 줄 높이 56px — web·앱 SectionHeader(h-14: web 27·앱 18). */
  sectionHeader: 'h-14',
  /** 화면 안 섹션 사이 32px — web 홈 섹션 목록(gap-y-8). 상세처럼 띠(구분선 면)로 나누는 화면은 띠가 간격을 대신한다. */
  sectionGap: 'gap-y-8',
  /** 섹션 위·아래 안쪽 여백(제목 줄이 없는 섹션) 24px — pt-6·mt-6·py-6 이 최다(web 21+10+13·앱 10+10+7). */
  sectionPadding: 'py-6',
  /** 묶음 안 간격. base = 항목 사이(gap-2: web 86·앱 37), loose = 묶음 사이(gap-3: 45·17), tight = 제목·부제처럼 붙는 글자 줄(gap-1). */
  stack: {tight: 'gap-1', base: 'gap-2', loose: 'gap-3'},
  /** 가로로 늘어놓는 칩·배지·아이콘+글자 사이. 칩 줄 = 8, 아이콘과 글자 = 4. */
  inline: {chip: 'gap-2', icon: 'gap-1'},
  /**
   * 조작 요소 높이. 같은 줄에 놓이는 요소는 같은 높이 이름을 쓴다.
   *   primary 48 = 화면 아래 주 버튼(button.size.lg)·큰 입력칸
   *   touch   44 = 글자 버튼·줄 전체가 눌리는 행의 최소 높이(손가락 크기 — Apple HIG 44pt)
   *   tab     36 = 채운 탭 md·최근 검색어 칩(tab.size.md·keywordChip)
   *   compact 32 = 채운 탭 sm·작은 칩
   */
  control: {primary: 'h-12', touch: 'h-11', tab: 'h-9', compact: 'h-8'},
  /**
   * 아이콘 크기(px). SVG 컴포넌트의 width/height 에 숫자로 넘긴다(web·앱 공통).
   *   nav 28 = 헤더·하단 탭(검색·내정보·뒤로)  action 24 = 줄 끝 동작(더보기 점·공유)
   *   row 20 = 목록 행·버튼 안 아이콘·토스트   inline 16 = 글자 옆(text-sm 과 같은 줄)
   */
  icon: {nav: 28, action: 24, row: 20, inline: 16},
  /** 손가락으로 누르는 것의 최소 크기(px). 아이콘이 작으면 겉 영역(hitSlop·패딩)으로 채운다. */
  minTouch: 44,
  /**
   * 겹침 층(z-index). 화면 위에 뜨는 것은 이 여섯 층 중 하나에 놓는다 — 콘텐츠 안의 작은 겹침(z-10~30)은 자유.
   *   sticky   붙어 있는 하위 헤더·하단 입력줄       header   상단 헤더·GNB·하단 구매 버튼·떠 있는 버튼
   *   nav      하단 탭바                              dropdown 메뉴·자동완성·고르기 목록(헤더·탭바 위)
   *   overlay  바텀시트·확인 창·공유 창(가림막 포함)   toast    잠깐 뜨는 알림 — 시트 위에서 띄워도 보이게 맨 위
   * 예전엔 9999·999·100·60 이 섞여 토스트(40)가 시트(9999) 아래에 깔렸고, 확인 창(50)이 하단 탭바(100)를 못 덮었다.
   * web 은 layerClass(Tailwind v4 는 정수 z-* 를 다 만든다), 앱은 style zIndex 에 layer 숫자(NativeWind v3 는 z-50 까지만).
   */
  layer: {sticky: 40, header: 50, nav: 60, dropdown: 70, overlay: 80, toast: 90},
  layerClass: {sticky: 'z-40', header: 'z-50', nav: 'z-60', dropdown: 'z-70', overlay: 'z-80', toast: 'z-90'},
};

module.exports = {layout};
