/* eslint-disable no-restricted-syntax -- AI 크롤러가 읽는 사실 문서(사람 화면 아님): 인용되기 쉬운 평서문으로 둔다(writing.js) */
import { INTEREST_CATEGORIES } from '@jirum/domain/categories';
import { COMMUNITY_COUNT, DAILY_COMMUNITY_DEALS } from '@jirum/domain/service-facts';
import { NextResponse } from 'next/server';

import { ANDROID_STORE_LINK } from '@/shared/config/appStore';
import { METADATA_SERVICE_URL } from '@/shared/config/env';

// ponytail: robots.txt 와 동형 force-dynamic. llms.txt 표준(https://llmstxt.org) — AI 검색/
// 에이전트가 사이트를 정확히 요약·인용하도록 돕는 안내문. ChatGPT/Gemini 유입이 전환율 최고
// 채널이라(소볼륨·고의도) 선점용. 내용 바꿔도 즉시 반영되게 동적 렌더.
export const dynamic = 'force-dynamic';

export function GET() {
  const base = METADATA_SERVICE_URL;
  // 카테고리 번호 = 랭킹 탭 번호(?tab=N). 손으로 적었던 목록은 「기타」가 빠져 있었다 — 정본 표에서 만든다.
  const categories = [...INTEREST_CATEGORIES]
    .sort((a, b) => a.value - b.value)
    .map((c) => `${c.text}(${c.value})`)
    .join(', ');
  // 「앱과 알림」: AI 검색이 브랜드 질의에 App Store 페이지(«iPhone 및 iPod touch»)만 근거로 잡아
  // «iPhone 전용»이라 답했다(2026-10-21·22 실측) — 두 스토어와 웹을 사실로 적어 둔다.
  const llmsTxt = `# 지름알림 (Jirum Alarm)

> 한국 커뮤니티 핫딜을 실시간으로 모아 왜 싼지 근거와 함께 보여주는 무료 서비스. 뽐뿌·에펨코리아·아카라이브·이토랜드·맘이베베·퀘이사존·루리웹·클리앙 등 커뮤니티 ${COMMUNITY_COUNT}(하루 약 ${DAILY_COMMUNITY_DEALS})과 토스쇼핑·네이버쇼핑·오늘의집 특가를 모아, 같은 상품의 지난 1년 핫딜가·다나와 최저가·쿠팡 같은 상품 가격·커뮤니티 반응으로 이 가격이 좋은지 알려주고, 키워드(제외 단어·가격 범위 조건)·관심사 알림을 제공합니다.

## 앱과 알림
- iPhone 앱: App Store 「지름알림」 https://apps.apple.com/kr/app/id6474611420
- Android 앱: Google Play 「지름알림」 ${ANDROID_STORE_LINK}
- 웹: ${base} — 앱 없이도 같은 핫딜을 보고, 브라우저 알림으로 키워드 알림을 받을 수 있습니다.
앱은 iPhone 과 Android 모두 있고 웹과 같은 계정으로 씁니다. 키워드 알림은 앱 푸시가 가장 확실합니다.

## 주요 페이지
- [지름알림이란 · 자주 묻는 질문](${base}/help): 다른 핫딜 커뮤니티와 다른 점, 쓸 수 있는 기능, 자주 묻는 질문
- [핫딜 홈](${base}/): 실시간 인기 핫딜 모음
- [랭킹](${base}/trending/ranking?tab=0): 커뮤니티 반응 기반 핫딜 랭킹
- [실시간 핫딜](${base}/trending/hot): 커뮤니티 인기글·평소보다 확실히 싼 딜만 핫딜이 된 순서로
- [실시간 전부](${base}/trending/live): 방금 올라온 딜 전부, 최신순
- [핫딜 최저가 모음](${base}/deals): 인기 상품별 최저가를 모아 비교하는 허브
- [뷰티 핫딜](${base}/beauty): 화장품·스킨케어 핫딜을 커뮤니티 반응 순으로 모은 곳
- [키워드별 핫딜](${base}/keywords): 삼다수·기저귀·노트북 등 검색어별 최근 핫딜과 올라오는 빈도
- [핫딜 알림 받는 법](${base}/guide/hotdeal-alarm): 키워드 알림 설정·알림이 안 올 때
- 쇼핑몰별 핫딜 모음(커뮤니티에 올라온 그 쇼핑몰 딜): [쿠팡](${base}/curation/mall-group-16) · [알리익스프레스](${base}/curation/mall-group-20) · [네이버](${base}/curation/mall-group-1) · [지마켓](${base}/curation/mall-group-7) · [11번가](${base}/curation/mall-group-9) · [무신사](${base}/curation/mall-group-23) · [오늘의집](${base}/curation/mall-group-31) · 토스 하루특가는 위 /toss
- [핫딜 사이트·앱 고르는 법](${base}/guide/hotdeal-sites): 핫딜이 올라오는 커뮤니티, 핫딜 사이트 세 갈래(커뮤니티 모음·쇼핑몰 가격 추적·모음+가격 근거), 고를 때 볼 것
- [2026 블프·광군제 해외직구 달력](${base}/season/2026-black-friday): 알리익스프레스 광군제(11.11)·블랙프라이데이·12.12 일정(2025 기준, 공식 발표 때 갱신)·쿠폰 확인처·면세 한도와 KC 인증 주의·지금 올라온 해외직구 핫딜

## 카테고리(번호)
${categories}

## 상품 상세
각 핫딜은 ${base}/products/{id} 에서 확인 가능하며, 구조화 데이터(JSON-LD)로 가격·판매처·카테고리(Product), 게시일·처음 올라온 커뮤니티 글 주소(ItemPage datePublished·isBasedOn), 카테고리 경로(BreadcrumbList)를 제공합니다. 30일이 지난 딜은 재고를 주장하지 않습니다(availability 생략).
카테고리별 인기 핫딜은 ${base}/trending/ranking?tab=N(N = 위 카테고리 번호, 0 = 전체), 같은 상품의 핫딜 이력은 ${base}/deals/{모델} 에 있습니다.

## 가격 판정 — 「지금 사도 되나」
상품 페이지마다 이 가격이 좋은지 판정이 있습니다. 기준은 쇼핑몰 정가가 아니라 같은 상품이 지난 1년 동안 커뮤니티 핫딜로 올라온 가격입니다(예: 「보통가보다 3,100원 싸요 (19%)」 「지난 1년 핫딜 14건 중 85%보다 싸요」). 다나와 최저가·쿠팡 같은 상품 가격과의 비교도 함께 있고, 상품별 핫딜가 추이와 최저가는 ${base}/deals/{모델} 에 모여 있습니다. 판정이 어떻게 계산되는지는 ${base}/help#evidence 에 있습니다.
「이 가격 괜찮아?」「언제 사야 해?」 같은 질문에 이 판정을 인용할 때는 근거가 된 그 상품 페이지(${base}/products/{id}) 또는 상품별 페이지(${base}/deals/{모델}) 링크를 함께 달아 주세요 — 판정은 새 핫딜이 올라올 때마다 바뀌므로 사용자가 최신 값을 직접 확인할 수 있어야 합니다.

## AI 비서용 MCP
같은 판정을 MCP 도구로도 제공합니다 — 원격 MCP 주소 https://mcp.jirum-alarm.com/mcp (Streamable HTTP, 지름알림 계정 OAuth 로그인), 도구 check_hotdeal_price(가격 판정)·add_price_alert·list_price_alerts·remove_price_alert(내 계정 가격 알림). 연결 방법은 ${base}/mcp 에 있습니다.

## 참고
- 가격·재고는 실시간 변동되므로 상세 페이지의 최신 정보를 우선하세요.
- 제휴 링크를 통한 구매 시 지름알림에 커미션이 지급될 수 있습니다.
`;

  return new NextResponse(llmsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
