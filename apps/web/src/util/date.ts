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

          console.log('period check - now:', now.format(), 'timezone:', timeZone);

          if (startDate) {
            const start = dayjs.tz(startDate, timeZone);
            console.log('period check - start:', start.format());
            if (now.isBefore(start)) {
              console.log('period check - before start, returning false');
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

            console.log('period check - end:', end.format());
            if (now.isAfter(end)) {
              console.log('period check - after end, returning false');
              return false;
            }
          }

          console.log('period check - in range, returning true');
          return true;
        } catch (error) {
          console.error('period check error:', error);
          // 에러 시 안전하게 false 반환
          return false;
        }
      },
    };
  },
});
