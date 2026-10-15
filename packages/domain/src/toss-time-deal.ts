/**
 * 선착순·타임특가 카드 배지·타이머 — web·앱 카드가 같이 쓴다.
 *
 * 토스 하루특가(토스 앱 「매일 밤 12시 선착순특가」): crawler 가 product.data.toss 에 그날 창
 * (todayDealStartAt/EndAt, KST 로컬시각 문자열 "2026-10-15T00:00:00"), dealStatus(ON_GOING /
 * TEMPORARILY_SOLD_OUT / SOLD_OUT), pageViewCount(앱 「N명이 봤어요」)를 남긴다.
 * 선착순 수량은 토스가 어디에도 주지 않아 마감 여부만 안다(2026-10-15 실측).
 * 배지 문구는 토스 앱 그대로 — 「선착순특가」 「하루만 N원」 「N만명이 봤어요」.
 *
 * 커뮤니티 예고 글(「오늘 17시 오픈」 「15일 자정」)은 제목에서 오픈 시각을 읽어 오픈 전이면 타이머를 단다.
 * 토스 다음 날 하루특가는 자정 전엔 안 보인다(날짜 탭은 앱 전용, 2026-10-15 실측) — 시작 시각이 미래인
 * 토스 딜이 들어오면 같은 「오픈 전」 표시를 탄다.
 */
export type TossTimeDealStatus = 'UPCOMING' | 'ON_SALE' | 'TEMPORARILY_SOLD_OUT' | 'SOLD_OUT';

export type TossTimeDeal = {
  status: TossTimeDealStatus;
  /** 사진 모서리 라벨. 판매 중 「선착순특가」, 마감이면 마감 문구, 오픈 전이면 「오늘 밤 12시 오픈」. */
  label: string;
  /** 가격 앞 「하루만」. 판매 중일 때만. */
  pricePrefix?: string;
  /** 「2,125명이 봤어요」. 조회가 적으면(100 미만) 없다 — 몇 명 안 본 숫자는 신호가 아니라 소음이다. */
  viewCountText?: string;
  /** 오픈 시각(epoch ms). 오픈 전일 때만. */
  openAt?: number;
  /** 종료 시각(epoch ms). */
  endAt: number;
};

const HOUR = 3_600_000;
const KST_OFFSET = 9 * HOUR;

/** KST 로컬시각 문자열. data.toss 의 창 시각과 같은 꼴이라 문자열 비교가 된다(서버 time-deal.logic 과 같다). */
export const kstLocalNow = (now: number = Date.now()): string =>
  new Date(now + KST_OFFSET).toISOString().slice(0, 19);

/** "2026-10-16T00:00:00"(KST 로컬) 또는 오프셋 붙은 ISO → epoch ms. */
const parseKstLocal = (s: string): number => {
  const hasOffset = /(Z|[+-]\d{2}:?\d{2})$/.test(s);
  return Date.parse(hasOffset ? s : `${s.slice(0, 19)}+09:00`);
};

type KstParts = { y: number; mo: number; d: number; h: number; mi: number };
const kstParts = (ms: number): KstParts => {
  const t = new Date(ms + KST_OFFSET);
  return {
    y: t.getUTCFullYear(),
    mo: t.getUTCMonth(),
    d: t.getUTCDate(),
    h: t.getUTCHours(),
    mi: t.getUTCMinutes(),
  };
};
const fromKst = (y: number, mo: number, d: number, h = 0, mi = 0): number =>
  Date.UTC(y, mo, d, h, mi) - KST_OFFSET;

/** 다음 KST 자정(epoch ms) — 토스 하루특가가 끝나고 새로 여는 시각. */
export const nextKstMidnight = (now: number = Date.now()): number => {
  const p = kstParts(now);
  return fromKst(p.y, p.mo, p.d + 1);
};

/** 남은 시간: 하루 미만은 「3:07:09」, 이상은 「2일 5시간」. */
export const formatCountdown = (ms: number): string => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  if (h >= 24) return `${Math.floor(h / 24)}일 ${h % 24}시간`;
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

/**
 * 오픈 시각 표기 — 「오늘 17:00」 「내일 10:00」 「10/18 10:00」.
 * 자정 정각은 앞날의 「밤 12시」로 읽힌다(「내일 00:00」보다 「오늘 밤 12시」가 자연스럽다).
 */
export const formatOpenAt = (openAt: number, now: number = Date.now()): string => {
  const midnight = kstParts(openAt).h === 0 && kstParts(openAt).mi === 0;
  const p = kstParts(midnight ? openAt - 1 : openAt);
  const today = kstParts(now);
  const dayDiff = Math.round(
    (fromKst(p.y, p.mo, p.d) - fromKst(today.y, today.mo, today.d)) / (24 * HOUR),
  );
  const day =
    dayDiff === 0 ? '오늘' : dayDiff === 1 ? '내일' : `${p.mo + 1}/${p.d}`;
  if (midnight) return `${day} 밤 12시`;
  return `${day} ${String(p.h).padStart(2, '0')}:${String(p.mi).padStart(2, '0')}`;
};

/** 토스 앱 표기: 1만 미만은 「2,125명」, 이상은 소수 한 자리 「1.2만명」(내림). */
export const formatTossViewCount = (count: number): string => {
  if (count >= 10_000) {
    const man = Math.floor(count / 1_000) / 10;
    return `${Number.isInteger(man) ? man : man.toFixed(1)}만명이 봤어요`;
  }
  return `${count.toLocaleString('ko-KR')}명이 봤어요`;
};

const MIN_VIEW_COUNT = 100;
/** 이만큼 먼 오픈은 「오픈 전」으로 안 보인다 — 예고가 너무 이르면 지금 볼 딜이 아니다. */
const MAX_LEAD_MS = 7 * 24 * HOUR;

/** 토스 하루특가 창이 열려 있거나(오늘) 곧 열리면 배지 정보, 아니면 null(지난 하루특가·일반 상품·커뮤니티 글). */
export function getTossTimeDeal(data: unknown, now: number = Date.now()): TossTimeDeal | null {
  const toss = (data as { toss?: unknown } | null | undefined)?.toss;
  if (!toss || typeof toss !== 'object') return null;
  const { todayDealStartAt, todayDealEndAt, dealStatus, pageViewCount } = toss as Record<
    string,
    unknown
  >;
  if (typeof todayDealStartAt !== 'string' || typeof todayDealEndAt !== 'string') return null;

  const startAt = parseKstLocal(todayDealStartAt);
  const endAt = parseKstLocal(todayDealEndAt);
  if (!Number.isFinite(startAt) || !Number.isFinite(endAt) || now >= endAt) return null;

  const viewCountText =
    typeof pageViewCount === 'number' && pageViewCount >= MIN_VIEW_COUNT
      ? formatTossViewCount(pageViewCount)
      : undefined;

  if (now < startAt) {
    if (startAt - now > MAX_LEAD_MS) return null;
    return {
      status: 'UPCOMING',
      label: `${formatOpenAt(startAt, now)} 오픈`,
      openAt: startAt,
      endAt,
      viewCountText,
    };
  }
  if (dealStatus === 'SOLD_OUT') {
    return { status: 'SOLD_OUT', label: '선착순 마감', viewCountText, endAt };
  }
  if (dealStatus === 'TEMPORARILY_SOLD_OUT') {
    return { status: 'TEMPORARILY_SOLD_OUT', label: '일시품절', viewCountText, endAt };
  }
  return { status: 'ON_SALE', label: '선착순특가', pricePrefix: '하루만', viewCountText, endAt };
}

/** 시각 뒤에 오면 「여는 시각」이 아니라 「끝나는 시각」이다 — 「오후 3시까지 주문」「자정 마감」「07시이전」. */
const CLOSING_AFTER = /^\s*(까지|마감|종료|이전|전까지|에\s*끝)/;
/** 시각 바로 뒤에 오면 여는 시각. */
const OPENING_AFTER = /^\s*(오픈|open|시작|부터|정각|~|라이브|live|라방|방송|판매|예정)/i;
/** 제목 어딘가에 있으면 예고 글로 본다(시각 뒤 말이 없을 때의 근거). */
const TEASER = /예고|오픈|선착|타임딜|타임\s?특가|라이브|live|라방/i;

type ParsedTime = {
  month?: number;
  dayOfMonth?: number;
  dayOffset?: number;
  hour: number;
  minute: number;
  /** 날짜·오늘/내일·오전/오후 없이 시각만 — 오전/오후·오늘/내일을 글 올린 시각으로 고른다. */
  bare: boolean;
  explicit: boolean;
};

/**
 * 제목에서 첫 「여는 시각」을 찾는다.
 * 날짜: 「9/17」「10.2」「9월 18일」「15일」(+ 「(금)」「금요일」), 상대: 오늘·내일·모레, 오전/오후/밤/새벽,
 * 시각: 「N시」「N시 N분」「N시 반」「자정」. 「1시간」「5090시리즈」「3.5시」는 시각이 아니다.
 */
const TIME_RE =
  /(?:(?:(\d{1,2})\s*(?:\/|\.|월)\s*(\d{1,2})\s*일?|(\d{1,2})\s*일)\s*(?:\(\s*[월화수목금토일]\s*\)|[월화수목금토일]요일|[월화수목금토일](?=\s))?\s*)?(오늘|내일|모레)?\s*(오전|오후|밤|새벽|저녁|아침)?\s*(?:(자정)(?![리렬])|(?<![\d.,/])(\d{1,2})\s*시(?!간)(?:\s*(\d{1,2})\s*분|\s*(반))?)/g;

/** 시각과 떨어져 앞에 적힌 날짜 — 「9/28~10/2 … (오후 2시~8시)」. 뒤에 「까지」가 붙은 날짜는 끝나는 날이라 뺀다. */
const LEADING_DATE_RE = /(?<![\d.,/])(\d{1,2})\s*(?:\/|\.|월)\s*(\d{1,2})(?!\d)\s*일?(?!\s*까지)/;

function findTime(title: string): ParsedTime | null {
  for (const m of title.matchAll(TIME_RE)) {
    const [whole, mdMonth, mdDay, dayOnly, rel, meridiem, midnight, hourStr, minStr, half] = m;
    const rest = title.slice((m.index ?? 0) + whole.length);
    if (CLOSING_AFTER.test(rest)) continue;
    let month = mdMonth ? Number(mdMonth) - 1 : undefined;
    let dayOfMonth = mdDay ? Number(mdDay) : dayOnly ? Number(dayOnly) : undefined;
    if (dayOfMonth == null && !rel) {
      const lead = title.slice(0, m.index ?? 0).match(LEADING_DATE_RE);
      if (lead) {
        month = Number(lead[1]) - 1;
        dayOfMonth = Number(lead[2]);
      }
    }
    if (month != null && (month < 0 || month > 11)) continue;
    if (dayOfMonth != null && (dayOfMonth < 1 || dayOfMonth > 31)) continue;

    let hour = midnight ? 0 : Number(hourStr);
    if (!midnight && (Number.isNaN(hour) || hour > 24)) continue;
    if (!midnight && /오후|밤|저녁/.test(meridiem ?? '') && hour < 12) hour += 12;
    if (!midnight && meridiem === '오전' && hour === 12) hour = 0;
    let dayOffset = rel === '내일' ? 1 : rel === '모레' ? 2 : rel === '오늘' ? 0 : undefined;
    // 「24시」·「오늘/내일 자정」은 그날이 끝나는 밤 12시 = 다음 날 0시.
    // 단 「15일 자정」은 커뮤니티 관행상 15일 0시다(「15일 자정 펩제」는 15일 0시에 열렸다, 10/15 실측).
    if (hour === 24 || (midnight && rel)) {
      hour = 0;
      dayOffset = (dayOffset ?? 0) + 1;
    }
    const minute = half ? 30 : minStr ? Number(minStr) : 0;
    if (minute > 59) continue;
    const dated = dayOfMonth != null || rel != null;
    return {
      month,
      dayOfMonth,
      dayOffset,
      hour,
      minute,
      bare: !dated && !meridiem && !midnight,
      explicit: dated || Boolean(meridiem || midnight) || OPENING_AFTER.test(rest),
    };
  }
  return null;
}

/**
 * 커뮤니티 예고 글 제목의 오픈 시각(epoch ms). 못 읽으면 null.
 * 시각만 있는 제목(「17시 …」)은 예고·오픈·선착 같은 말이 같이 있어야 믿는다 — 「24시 편의점」 오탐 방지.
 * 날짜 없이 시각만 있으면 글 올린 시각(1시간 여유) 뒤 첫 시각으로 읽는다 — 12:40 글 「1시오픈」은 13시,
 * 08:58 글 「4시판매예정」은 16시, 23:19 글 「12시 선착순」은 자정(2026-10-15 30일 제목 187개 실측).
 */
export function parseOpenAtFromTitle(title: string, postedAt: string | number | Date): number | null {
  const posted =
    postedAt instanceof Date
      ? postedAt.getTime()
      : typeof postedAt === 'number'
        ? postedAt
        : Date.parse(postedAt);
  if (!title || !Number.isFinite(posted)) return null;
  const t = findTime(title);
  if (!t) return null;
  if (!t.explicit && !TEASER.test(title)) return null;

  const p = kstParts(posted);
  // 글 올린 시각보다 1시간 안쪽으로 앞선 시각은 「방금 열린」 것으로 본다(19:52 글 「7시 라방」= 19시).
  const grace = posted - HOUR;
  let openAt: number;
  if (t.dayOfMonth != null) {
    // 월이 없으면 이달 — 글 올린 날보다 일주일 넘게 앞이면 다음 달. 월이 반년 넘게 앞이면 다음 해.
    const month = t.month ?? (t.dayOfMonth < p.d - 7 ? p.mo + 1 : p.mo);
    const year = t.month != null && t.month < p.mo - 6 ? p.y + 1 : p.y;
    openAt = fromKst(year, month, t.dayOfMonth + (t.dayOffset ?? 0), t.hour, t.minute);
  } else if (t.bare) {
    // 오전/오후를 안 쓴 「N시」 — 오늘 N시 → 오늘 N+12시 → 내일 N시 중 글 올린 뒤 첫 시각.
    const h = t.hour;
    const hours =
      h >= 1 && h <= 11 ? [h, h + 12, 24 + h] : h === 12 ? [12, 24, 36] : [h, 24 + h];
    const candidates = hours.map((x) => fromKst(p.y, p.mo, p.d, x, t.minute));
    openAt = candidates.find((c) => c >= grace) ?? candidates[candidates.length - 1];
  } else {
    openAt = fromKst(p.y, p.mo, p.d + (t.dayOffset ?? 0), t.hour, t.minute);
    if (t.dayOffset == null && openAt < grace) openAt += 24 * HOUR;
  }
  if (openAt < posted - HOUR || openAt - posted > MAX_LEAD_MS) return null;
  return openAt;
}

export type TimeDealOpening = { openAt: number; label: string };

/**
 * 아직 안 연 시간 한정 딜이면 오픈 시각·라벨(「오늘 17:00 오픈」). 토스는 data.toss 창, 그 밖은 제목.
 * 이미 열렸거나 끝난 딜·시각을 못 읽은 글은 null.
 */
export function getTimeDealOpening(
  product: {
    title?: string | null;
    postedAt?: string | number | Date | null;
    data?: unknown;
    isEnd?: boolean | null;
  },
  now: number = Date.now(),
): TimeDealOpening | null {
  if (product.isEnd) return null;
  const toss = getTossTimeDeal(product.data, now);
  if (toss) {
    return toss.status === 'UPCOMING' && toss.openAt
      ? { openAt: toss.openAt, label: toss.label }
      : null;
  }
  if ((product.data as { toss?: unknown } | null | undefined)?.toss) return null;
  if (!product.title || product.postedAt == null) return null;
  const openAt = parseOpenAtFromTitle(product.title, product.postedAt);
  if (openAt == null || openAt <= now) return null;
  return { openAt, label: `${formatOpenAt(openAt, now)} 오픈` };
}

/**
 * 상세 화면 타이머 — 무엇을 셀지(web·앱 상세가 같이 쓴다).
 *  - closing: 판매 중인 토스 하루특가 → 끝나는 시각까지(「오늘 밤 12시 종료 · 3:12:45 남음」)
 *  - opening: 오픈 전(토스 다음 날 특가·커뮤니티 예고 글) → 여는 시각까지
 *  - soldOut: 선착순 마감·일시품절 → 타이머 없이 상태만(수량은 모르니 막대·「N개 남음」은 만들지 않는다)
 * ★상세를 연 시각에 한 번 정하고, 0이 되면 화면이 「끝났어요」/「지금 오픈」으로 바꾼다 — 다시 세지 않는다
 *   (새로고침·0에서 다시 도는 타이머는 가짜 긴급성: 영국 CMA Emma Sleep·FTC 2022, 2026-10-15 조사).
 * 종료 시각을 모르는 딜엔 타이머를 내지 않는다.
 */
export type TimeDealTimer =
  | { kind: 'closing'; endAt: number; endLabel: string }
  | { kind: 'opening'; openAt: number; label: string }
  | { kind: 'soldOut'; label: string };

export function getTimeDealTimer(
  product: {
    title?: string | null;
    postedAt?: string | number | Date | null;
    data?: unknown;
    isEnd?: boolean | null;
  },
  now: number = Date.now(),
): TimeDealTimer | null {
  if (product.isEnd) return null;
  const toss = getTossTimeDeal(product.data, now);
  if (toss?.status === 'ON_SALE') {
    return { kind: 'closing', endAt: toss.endAt, endLabel: `${formatOpenAt(toss.endAt, now)} 종료` };
  }
  if (toss?.status === 'SOLD_OUT' || toss?.status === 'TEMPORARILY_SOLD_OUT') {
    return { kind: 'soldOut', label: toss.label };
  }
  const opening = getTimeDealOpening(product, now);
  return opening ? { kind: 'opening', openAt: opening.openAt, label: opening.label } : null;
}
