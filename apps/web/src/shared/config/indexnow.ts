/**
 * IndexNow 소유 확인 키.
 *
 * **비밀이 아니다** — 누구나 `/indexnow-key.txt` 로 읽을 수 있고 그게 프로토콜 설계다
 * (키를 이 도메인에서 서빙할 수 있다 = 이 도메인의 주인이다). 그래서 env 가 아니라 상수다.
 * 짝은 crawling-server `src/common/lib/indexnow.ts` 의 `INDEXNOW_KEY` — **두 값이 같아야 한다.**
 *
 * 왜 필요한가: Bing 인덱스가 ChatGPT 검색·Copilot 의 원천이고, IndexNow 제출은 참여 엔진
 * (Bing·Naver·Yandex·Seznam·Yep) 전체에 공유된다. 한 번 보내면 Bing 과 네이버가 같이 받는다.
 * 구글은 IndexNow 를 쓰지 않으므로 사이트맵 경로가 그대로 정본이다.
 */
export const INDEXNOW_KEY = '1954ba361635bcd108dd6c74ce8f65ed';
