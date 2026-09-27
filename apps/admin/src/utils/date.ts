import dayjs from 'dayjs';

export const dateFormatter = (date: string | number) => {
  return dayjs(date).format('YYYY/MM/DD');
};

export const formatStatsDate = (date: string | number) => {
  const num = Number(date);
  if (!isNaN(num)) {
    // 10자리 이하면 초 단위 타임스탬프, 13자리면 밀리초 단위
    return num > 9_999_999_999 ? dayjs(num).format('YY/MM/DD') : dayjs.unix(num).format('YY/MM/DD');
  }
  return dayjs(date).format('YY/MM/DD');
};

// 통계 서버는 TZ=Asia/Seoul 에서 `createdAt >= startDate AND createdAt < endDate` 로 자른다.
// toISOString() 은 UTC 라 KST 00~09시엔 날짜가 하루 밀리고, 'YYYY-MM-DD' 만 보내면
// new Date() 가 UTC 자정(=KST 09시)으로 읽어 경계가 9시간 어긋난다 → KST 자정 오프셋을 붙여 보낸다.
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** 해당 시각의 KST 달력 날짜 'YYYY-MM-DD' (date input 값으로 그대로 쓴다) */
export const toKstDateString = (date: Date = new Date()) =>
  new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);

/** 오늘(KST)에서 days 일 전의 KST 날짜 */
export const kstDaysAgo = (days: number, now: Date = new Date()) =>
  toKstDateString(new Date(now.getTime() - days * DAY_MS));

/** 오늘(KST)에서 months 달 전의 KST 날짜 (말일 넘침은 Date 규칙대로) */
export const kstMonthsAgo = (months: number, now: Date = new Date()) => {
  const kst = new Date(now.getTime() + KST_OFFSET_MS);
  kst.setUTCMonth(kst.getUTCMonth() - months);
  return kst.toISOString().slice(0, 10);
};

/**
 * 화면의 포함 구간 [start, end] (KST 날짜) → 서버 인자 [startDate, endDate).
 * 서버 endDate 가 exclusive 라 종료일 다음 날 KST 자정을 보내야 종료일(오늘)이 포함된다.
 */
export const toStatsDateRange = (startDate: string, endDate: string) => {
  const nextDay = new Date(new Date(`${endDate}T00:00:00Z`).getTime() + DAY_MS)
    .toISOString()
    .slice(0, 10);
  return {
    startDate: `${startDate}T00:00:00+09:00`,
    endDate: `${nextDay}T00:00:00+09:00`,
  };
};
