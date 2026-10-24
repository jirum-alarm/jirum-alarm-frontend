/**
 * 방해금지 시간 — 서버(user_push_setting.quietHoursStart/End, KST 시 0~23)와 같은 규칙.
 * [start, end) 동안 키워드·핫딜·커뮤니티 푸시를 모아 뒀다가 end 시각에 보낸다. 자정을 넘길 수 있다(23→7).
 * web·앱 알림 설정 화면이 같이 쓴다(@jirum/domain).
 */
export type QuietHours = { start: number; end: number };

/** 켤 때 제안값 = 업무 시간(9~18시). */
export const DEFAULT_QUIET_HOURS: QuietHours = { start: 9, end: 18 };

export const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

/** 0 → 오전 12시, 9 → 오전 9시, 12 → 오후 12시, 18 → 오후 6시 */
export const formatHour = (hour: number) => {
  const half = hour < 12 ? '오전' : '오후';
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${half} ${h}시`;
};

/** 옛 서버·옛 캐시처럼 필드가 아예 없을(undefined) 때도 꺼짐으로 본다. */
export const toQuietHours = (start: number | null, end: number | null): QuietHours | null =>
  typeof start !== 'number' || typeof end !== 'number' || start === end ? null : { start, end };

/**
 * 야간 — 야간 수신 동의가 없으면 [start, end) 동안 광고성 알림(좋은 딜)을 모아 end 시각에 보낸다(서버 규칙).
 * 직접 건 키워드·관심사·커뮤니티 알림은 밤에도 바로 간다(2026-10-24~).
 * 사용법(/help·/guide)·소개 페이지 문구도 이 값으로 쓴다.
 */
export const NIGHT_HOURS: QuietHours = { start: 21, end: 8 };

/** 「밤 9시부터 아침 8시」 */
export const NIGHT_HOURS_TEXT = `밤 ${NIGHT_HOURS.start - 12}시부터 아침 ${NIGHT_HOURS.end}시`;

/** 설정 행 아래 한 줄 안내. */
export const describeQuietHours = (quiet: QuietHours) =>
  `${formatHour(quiet.start)}부터 ${formatHour(quiet.end)} 전까지 온 알림은 ${formatHour(
    quiet.end,
  )}에 모아서 보내드려요`;
