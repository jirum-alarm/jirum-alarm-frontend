import dayjs, { DayjsTimezone } from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/ko';

export type TimeZone = 'Asia/Seoul' | 'America/New_York';

dayjs.locale('ko');
dayjs.extend(relativeTime);
dayjs.extend(timezone);
dayjs.extend(utc);

export const getDayBefore = (type: number) => {
  return dayjs().add(-type, 'day').startOf('minute').toDate();
};

export const getFromNow = (date: string) => {
  const dayjsDate = dayjs(date);
  if (!dayjsDate.isValid()) return null;

  if (dayjsDate.isSame(dayjs(), 'day')) {
    return dayjsDate.format('A h시');
  }

  return dayjsDate.fromNow();
};

export const period = (timeZone: TimeZone = 'Asia/Seoul') => ({
  startAt: (startDate: string) => {
    return {
      endAt: (endDate: string) => {
        try {
          const now = dayjs.tz(new Date(), timeZone);

          if (startDate) {
            const start = dayjs.tz(startDate, timeZone);
            if (now.isBefore(start)) {
              return false;
            }
          }

          if (endDate) {
            let end = dayjs.tz(endDate, timeZone);
            const hasTimeComponent = /(\d{2}:\d{2})/.test(endDate);

            if (!hasTimeComponent) {
              // 기존 코드 호환성 사유로 추가 (이전 시간 동작 호환)
              end = end.endOf('day');
            }

            if (now.isAfter(end)) {
              return false;
            }
          }

          return true;
        } catch (error) {
          // 에러 시 안전하게 false 반환
          return false;
        }
      },
    };
  },
});
