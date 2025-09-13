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
  start: (startDate: string) => {
    return {
      end: (endDate: string) => {
        const now = dayjs().tz(timeZone);

        if (startDate) {
          const start = dayjs(startDate).tz(timeZone);
          if (now.isBefore(start)) {
            return false;
          }
        }

        if (endDate) {
          const end = dayjs(endDate).tz(timeZone).endOf('day');
          if (now.isAfter(end)) {
            return false;
          }
        }

        return true;
      },
    };
  },
});
