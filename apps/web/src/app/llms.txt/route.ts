import { NextResponse } from 'next/server';

import { METADATA_SERVICE_URL } from '@/shared/config/env';

// ponytail: robots.txt 와 동형 force-dynamic. llms.txt 표준(https://llmstxt.org) — AI 검색/
// 에이전트가 사이트를 정확히 요약·인용하도록 돕는 안내문. ChatGPT/Gemini 유입이 전환율 최고
// 채널이라(소볼륨·고의도) 선점용. 내용 바꿔도 즉시 반영되게 동적 렌더.
export const dynamic = 'force-dynamic';

export function GET() {
  const base = METADATA_SERVICE_URL;
  const llmsTxt = `# 지름알림 (Jirum Alarm)

> 한국 커뮤니티 핫딜을 실시간으로 모아 다나와 최저가와 비교해주는 서비스. 뽐뿌·클리앙·루리웹·퀘이사존 등 주요 커뮤니티의 핫딜을 크롤링해 AI로 정가 대비 할인율을 3단계로 평가하고, 관심 키워드·카테고리 알림을 제공합니다.

## 주요 페이지
- [핫딜 홈](${base}/): 실시간 인기 핫딜 모음
- [랭킹](${base}/trending/ranking): 커뮤니티 반응 기반 핫딜 랭킹
- [실시간](${base}/trending/live): 방금 올라온 최신 핫딜
- [핫딜 최저가 모음](${base}/deals): 인기 상품별 최저가를 모아 비교하는 허브

## 카테고리
컴퓨터, 생활/식품, 화장품, 도서, 가전/가구, 등산/레저, 디지털, 육아, 상품권, 의류/잡화

## 상품 상세
각 핫딜은 ${base}/products/{id} 에서 확인 가능하며, Product 구조화 데이터(JSON-LD)로 가격·판매처·카테고리를 제공합니다.

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
