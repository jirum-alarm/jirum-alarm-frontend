/**
 * 2026 해외직구 시즌 허브의 달력·지금 상태. 순수 함수만(웹 node:test 가 별칭 없이 읽는다).
 *
 * 날짜의 정본: 알리 2026 공식 일정은 11월 초 발표 예정이라(2026-10-19 기준 미발표) 여기는 **2025년 실제 일정**을 적고 그렇다고 밝힌다.
 * 발표되면 이 파일과 서버 시즌 달력(crawling-server product/overseas-sale.logic — env 로 덮음)을 같이 고친다.
 * 2026 날짜로 적은 것은 달력으로 정해지는 것뿐이다: 광군제 11/11, 美 블랙프라이데이(추수감사절 다음 날) 11/27·사이버먼데이 11/30.
 * 근거: 알리 2025 광군제 11/11~19(세계일보 2025-11-10)·초이스데이 11/1~7·블프 11/20~12/3(블로그 정리, 공식 아님)·
 * G마켓 빅스마일데이 2025 11/1~11(딜사이트)·코리아세일페스타 2025 11/1~30·무신사 무진장 25 겨울 블프 11/16~26(무신사 뉴스룸).
 * 12.12 는 공식 기간을 못 찾았다 — 지름알림 2025 알리 주문이 12/8~12 에 몰린 사실만 적는다.
 */
export type SeasonEvent = {
  name: string;
  /** 사람이 읽는 기간 — 2025 기준이면 그렇게 적는다 */
  when: string;
  note?: string;
};

export const OVERSEAS_EVENTS: SeasonEvent[] = [
  { name: '알리 초이스데이', when: '2025년 11/1~11/7', note: '광군제 전 몸풀기 할인' },
  {
    name: '알리 광군제(11.11)',
    when: '매년 11/11 시작 · 2025년 11/11~11/19',
    note: '딜이 가장 많이 올라오는 주 — 작은 생활용품을 많이 사요',
  },
  {
    name: '알리 블랙프라이데이',
    when: '2025년 11/20~12/3',
    note: '작년 지름알림에서 알리 주문이 가장 컸던 기간',
  },
  {
    name: '알리 12.12',
    when: '12월 둘째 주',
    note: '2025년엔 12/8~12/12 주문이 몰렸어요(12/10 최고)',
  },
];

export const US_EVENTS: SeasonEvent[] = [
  { name: '미국 블랙프라이데이', when: '2026년 11/27(금)', note: '아마존·이베이 등 미국 쇼핑몰' },
  { name: '사이버먼데이', when: '2026년 11/30(월)' },
];

/** 국내 행사 — 큰 몫은 이미 쇼핑몰별 핫딜로 들어온다. 허브는 일정과 «지금 올라온 딜» 검색 링크만. */
export const DOMESTIC_EVENTS: (SeasonEvent & { searchKeyword: string })[] = [
  { name: 'G마켓·옥션 빅스마일데이', when: '2025년 11/1~11/11', searchKeyword: '빅스마일데이' },
  { name: '11번가 그랜드 십일절', when: '매년 11/1~11/11 무렵', searchKeyword: '십일절' },
  { name: '코리아세일페스타', when: '2025년 11/1~11/30', searchKeyword: '코리아세일페스타' },
  { name: '무신사 무진장 겨울 블프', when: '2025년 11/16~11/26', searchKeyword: '무진장' },
  { name: '올리브영 올영세일(12월)', when: '12월 첫 주 무렵', searchKeyword: '올영세일' },
];

const DAY_MS = 86_400_000;
const KST_MS = 9 * 3_600_000;

/** KST 달력 날짜 'YYYY-MM-DD'. */
export const kstDate = (nowMs: number): string =>
  new Date(nowMs + KST_MS).toISOString().slice(0, 10);

const daysUntil = (nowMs: number, ymd: string): number =>
  Math.round((Date.parse(`${ymd}T00:00:00Z`) - Date.parse(`${kstDate(nowMs)}T00:00:00Z`)) / DAY_MS);

export type SeasonStatus = { label: string; live: boolean };

/** 머리의 «지금» 한 줄 — 서버 렌더 시각 기준(데이터 캐시 10분이라 그만큼 늦을 수 있다). */
export function seasonStatus(nowMs: number): SeasonStatus {
  const today = kstDate(nowMs);
  if (today < '2026-11-11') {
    const days = daysUntil(nowMs, '2026-11-11');
    return { label: `광군제(11/11)까지 D-${days}`, live: false };
  }
  if (today < '2026-11-20') {
    return { label: '광군제 진행 중 · 블프는 작년엔 11/20 시작', live: true };
  }
  if (today < '2026-12-04') {
    return { label: '블랙프라이데이 기간 · 작년엔 12/3까지', live: true };
  }
  if (today <= '2026-12-12') {
    return { label: '12.12 기간 · 작년엔 12/8~12/12 주문이 몰렸어요', live: true };
  }
  return { label: '2026 시즌이 끝났어요', live: false };
}
